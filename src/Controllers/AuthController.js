const { Usuario } = require("../Models/UsuarioModel");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sanitizeObject = require("../util/sanitize");
const { logger } = require("../util/logger");

const verifyTurnstile = async (captchaToken) => {
  try {
    const url = `https://www.google.com/recaptcha/api/siteverify`;

    const response = await axios.post(url, null, {
      params: {
        secret: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
        response: captchaToken,
      },
    });
    return response.data.success;
  } catch (error) {
    logger.error("Error al verificar el CAPTCHA:", error.message);
    return false;
  }
};

exports.Login = async (req, res) => {
  try {
    const sanitizedData = sanitizeObject(req.body);

    const { email, password } = sanitizedData;

    const { captchaToken } = req.body;

    let usuario;

    if (!email || !password) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    usuario = await Usuario.findOne({ email }).populate("estadoCuenta");
    if (!usuario) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const estadoCuenta = usuario.estadoCuenta;

    if (estadoCuenta.estado === "bloqueada") {
      const ahora = Date.now();
      const tiempoRestante =
        estadoCuenta.fechaDeUltimoBloqueo.getTime() +
        estadoCuenta.tiempoDeBloqueo * 1000 -
        ahora;

      if (tiempoRestante > 0) {
        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta nuevamente en ${Math.ceil(
            tiempoRestante / 1000
          )} segundos.`,
          tiempo: estadoCuenta.tiempoDeBloqueo,
          numeroDeIntentos: estadoCuenta.intentosFallidos,
        });
      }

      // Restablecer estado de cuenta después de que haya pasado el tiempo de bloqueo
      estadoCuenta.estado = "activa";
      estadoCuenta.intentosFallidos = 0;
      estadoCuenta.fechaDeUltimoBloqueo = null;
      await estadoCuenta.save();
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      estadoCuenta.intentosFallidos += 1;
      estadoCuenta.fechaUltimoIntentoFallido = new Date();

      if (estadoCuenta.intentosFallidos >= estadoCuenta.intentosPermitidos) {
        estadoCuenta.estado = "bloqueada";
        estadoCuenta.fechaDeUltimoBloqueo = new Date();

        const ahora = Date.now();
        const tiempoRestante =
          estadoCuenta.fechaDeUltimoBloqueo.getTime() +
          estadoCuenta.tiempoDeBloqueo * 1000 -
          ahora;
        await estadoCuenta.save();

        logger.error(
          `Cuenta bloqueada para el usuario: ${email}, demasiados intentos fallidos.`
        );
        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta nuevamente en ${Math.ceil(
            tiempoRestante / 1000
          )}  segundos.`,
          tiempo: `${Math.ceil(tiempoRestante / 1000)}`,
          numeroDeIntentos: estadoCuenta.intentosFallidos,
        });
      }

      await estadoCuenta.save();
      return res.status(401).json({
        message: `Credenciales inválidas.`,
      });
    }

    const isCaptchaValid = await verifyTurnstile(captchaToken);
    if (!isCaptchaValid) {
      logger.warn(`Captcha inválido para el usuario: ${email}`);
      return res.status(400).json({ message: "Captcha inválido" });
    }

    estadoCuenta.intentosFallidos = 0;
    await estadoCuenta.save();

    if (!usuario.rol) {
      logger.error("Error: El usuario no tiene un rol asignado");
      return res
        .status(401)
        .json({ message: "El usuario no tiene un rol asignado" });
    }

    const token = jwt.sign(
      { _id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    return res
      .status(200)
      .json({ token, rol: usuario.rol, captchaValid: isCaptchaValid });
  } catch (error) {
    logger.error("Error en Login:", error.message);
    return res
      .status(500)
      .json({ message: "Error en el servidor: " + error.message });
  }
};

exports.registrarUsuarioGoogle = async (req, res) => {
  try {
    // Sanitizar entrada
    const sanitizedData = sanitizeObject(req.body);
    const { uid, email, displayName, photoURL, phoneNumber } = sanitizedData;

    // Validaciones
    if (!uid || !email) {
      return res.status(400).json({ message: "Datos inválidos." });
    }

    let usuario = await Usuario.findOne({ email });

    if (!usuario) {
      // Crear nuevo usuario si no existe
      usuario = new Usuario({
        uid,
        telefono: phoneNumber || "",
        email,
        nombre: displayName,
        photoURL,
        fechaDeRegistro: new Date(),
      });

      await usuario.save();
    }

    // Crear token JWT para la sesión
    const token = jwt.sign(
      { _id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      token,
    });
  } catch (error) {
    console.error("Error al registrar usuario con Google:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
