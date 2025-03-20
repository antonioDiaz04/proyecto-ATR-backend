const { Usuario, EstadoCuenta } = require("../Models/UsuarioModel");
require("../Routes/UsuarioRoute");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { logger } = require("../util/logger");

exports.perfilUsuario = async (req, res) => {
  try {
    const { correo } = req.params.correo;

    const usuario = await Usuario.findOne({ correo })
      .populate("municipioId.municipio")
      .populate("coloniaId.colonia");
    // Verificar si el usuario existe
    if (!usuario) {
      logger.warn(`Usuario no encontrado: ${correo}`); // Advertencia
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Devolver los datos del perfil del usuario
    return res.status(200).json({ datos: usuario });
  } catch (error) {
    logger.error(`Error en perfilUsuario: ${error.message}`);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Middleware para verificar el token y el rol del usuario
exports.verifyTokenAndRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. Debes iniciar sesión." });
  }

  // Verificar si el usuario tiene el rol adecuado
  if (req.user.role !== role) {
    logger.warn("Acceso denegado. Debes iniciar sesión.");
    return res
      .status(403)
      .json({ message: `Acceso denegado. Debes ser ${role}.` });
  }

  // Si el usuario está autenticado y tiene el rol adecuado, continuar con la siguiente función
  next();
};

exports.getColoniasPorClientes = async (req, res) => {
  try {
    const clientes = await Usuario.find({ rol: { $ne: "ADMINPG" } });

    const resultado = {};

    clientes.forEach((cliente) => {
      const { municipio, colonia, nombre } = cliente;

      if (!resultado[municipio]) {
        resultado[municipio] = {};
      }

      if (!resultado[municipio][colonia]) {
        resultado[municipio][colonia] = [];
      }

      resultado[municipio][colonia].push(nombre);
    });

    res.json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener clientes agrupados", error });
  }
};
// // Ruta protegida para administradores
// exports.adminRoute = exports.verifyTokenAndRole("ADMIN");
// // Ruta protegida para clientes
// exports.clienteRoute = exports.verifyTokenAndRole("cliente");

exports.EstadoUsuario = async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    if (!cookie) {
      logger.warn("No autentificado: Cookie no proporcionada");
      return res.status(401).send({
        message: "no autentificado",
      });
    }
    const claims = jwt.verify(cookie, "secret");
    logger.warn("No autentificado: Token inválido");

    if (!claims) {
      return res.status(401).send({
        message: "no  autentificado",
      });
    }
    const usuario = await Usuario.findOne({ _id: claims._id });
    if (!usuario) {
      logger.warn("Usuario no encontrado");
      return res.status(401).send({
        message: "Usuario no encontrado",
      });
    }

    const { password, ...data } = await usuario.toJSON();
    res.send(data);
  } catch (error) {
    logger.error(`Error en EstadoUsuario: ${error.message}`);
    return res.status(401).send({
      message: "no autentificado",
    });
  }
};

function cleanPhoneNumber(phoneNumber) {
  let cleanedPhoneNumber = phoneNumber.replace(/^\+?\d{1,4}\s?/g, "");

  cleanedPhoneNumber = cleanedPhoneNumber.replace(/\D/g, "");
  return cleanedPhoneNumber;
}

exports.checkTelefono = async (req, res) => {
  try {
    const { telefono } = req.body;
    const telefonoFormateado = cleanPhoneNumber(telefono);

    const telefonoDuplicado = await Usuario.findOne({
      telefono: telefonoFormateado,
    });

    if (telefonoDuplicado) {
      logger.warn("El número de teléfono ya está registrado");
      return res
        .status(400)
        .json({ message: "El numero de telefono ya está registrado" });
    }

    // Respuesta de éxito si el email está disponible
    return res.status(200).json({ message: "El telefono está disponible" });
  } catch (error) {
    logger.error(`Error en checkTelefono: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.toString() });
  }
};

exports.checkEmail = async (req, res) => {
  try {
    let email = req.body.email;

    const record = await Usuario.findOne({ email: email });

    if (record) {
      logger.warn("El email ya está registrado");
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    return res.status(200).json({ message: "El email está disponible" });
  } catch (error) {
    logger.error(`Error en checkEmail: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.toString() });
  }
};
exports.checkCode = async (req, res) => {
  try {
    let code = req.body.code;

    const record = await Usuario.findOne({ codigoVerificacion: code });

    if (!record) {
      logger.warn("El código es incorrecto");
      return res.status(400).json({ message: "El codigo es incorrecto" });
    }

    // Respuesta de éxito si el email está disponible
    return res.status(200).json({ message: "El codigo es correcto" });
  } catch (error) {
    logger.error(`Error en checkCode: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.toString() });
  }
};

exports.crearUsuario = async (req, res) => {
  try {
    let { nombre, telefono, email, password } = req.body;

    // Validar que todos los campos estén presentes
    if (!nombre || !telefono || !email || !password) {
      logger.warn("Todos los campos son obligatorios");
      return res
        .status(400)
        .send({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el email ya está registrado
    const record = await Usuario.findOne({ email: email });
    if (record) {
      logger.warn("El email ya está registrado");
      return res.status(400).send({ message: "El email ya está registrado" });
    } // Eliminar espacios en el teléfono

    // const telefonoFormateado = cleanPhoneNumber(telefono);
    // if (!telefonoFormateado) {
    //   logger.warn("El número telefónico no es válido");
    //   return res
    //     .status(400)
    //     .send({ message: "El número telefónico no es válido" });
    // }

    // // Verificar si el número de teléfono ya está registrado
    // const exist_number = await Usuario.findOne({
    //   telefono: telefonoFormateado,
    // });
    // if (exist_number) {
    //   logger.warn("El número telefónico ya está registrado");
    //   return res
    //     .status(400)
    //     .send({ message: "El número telefónico ya está registrado" });
    // }

    const primerUsuario = await Usuario.findOne().populate("estadoCuenta");

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { intentosPermitidos, tiempoDeBloqueo } = primerUsuario.estadoCuenta;

    // Crear un nuevo estado de cuenta
    const nuevoEstadoCuenta = await EstadoCuenta.create({
      intentosPermitidos,
      tiempoDeBloqueo,
    });

    // Crear el nuevo usuario
    const usuario = new Usuario({
      nombre,
      email,
      telefono: telefono,
      // telefonoFormateado
      password: hashedPassword,
      estadoCuenta: nuevoEstadoCuenta._id,
      token: "",
      codigoVerificacion: null,
      verificado: false,
    });

    const resultado = await usuario.save();

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

    // Responder con éxito
    return res.json({
      usuario: resultado._id,
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    logger.error(`Error en crearUsuario: ${error.message}`);
    return res
      .status(500)
      .send({ message: "Error en el servidor", error: error.toString() });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Usuario.deleteOne({ _id: id });
    if (result) {
      logger.info("Usuario eliminado con éxito");
      res.status(200).json({ message: "Usuario eliminado con éxito." });
    }
  } catch (error) {
    logger.error(`Error en eliminarUsuario: ${error.message}`);
    res.status(500).send("Error en el servidor: " + error);
  }
};

exports.editarUsuario = async (req, res) => {
  try {
    const { nombre, telefono, email, password } = req.body;
    const usuario = await Usuario.findOne({ email: email });

    if (!usuario) {
      logger.warn("Usuario no encontrado");
      return res.status(404).send("Usuario no encontrado.");
    }
    // Encripta la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    usuario.nombre = nombre;
    usuario.email = email;
    usuario.telefono = telefono;
    usuario.password = hashedPassword;
    await usuario.save();

    logger.info("Usuario actualizado correctamente");
    res.status(200).send("Usuario actualizado correctamente.");
  } catch (error) {
    logger.error(`Error en editarUsuario: ${error.message}`);
    res.status(500).send("Error en el servidor: " + error);
  }
};

exports.obtenerUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      logger.warn("Usuario no encontrado");
      return res.status(404).json({ msg: "usuario Not Found" });
    }
    res.json(usuario);
  } catch (error) {
    logger.error(`Error en obtenerUsuarioById: ${error.message}`);
    res.status(404).send("ucurrio un error");
  }
};

exports.buscaUsuarioByCorreo = async (req, res) => {
  try {
    let usuario = await Usuario.findOne(
      { correo: req.params.correo },
      { _id: 1 }
    );
    if (usuario) {
      res.json({ usuarioId: usuario._id });
    } else {
      logger.warn("Usuario no encontrado");
      res.json({ msg: "Usuario no encontrado" });
    }
  } catch (error) {
    logger.error(`Error en buscaUsuarioByCorreo: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.BuscaUsuarioByCorreo = async (req, res) => {
  try {
    const { correo } = req.body;

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      logger.warn("Usuario no encontrado");
      return res
        .status(404)
        .json({ message: "usuario con este correo no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    logger.error(`Error en buscaUsuarioByCorreo: ${error.message}`);
    res.status(404).send("ocurrio un error");
  }
};

exports.BuscaUsuarioByToken = async (req, res) => {
  try {
    const { correo, token } = req.body;

    const usuario = await Usuario.findOne({ correo: correo, token: token });

    if (!usuario) {
      logger.warn("Usuario no encontrado");
      return res.status(404).json({ message: "usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    logger.error(`Error en BuscaUsuarioByToken: ${error.message}`);
    res.status(404).send("ocurrio un error");
  }
};

exports.BuscaUsuarioByPreguntayRespuesta = async (req, res) => {
  try {
    const { pregunta, respuesta } = req.body;

    const usuario = await Usuario.findOne({
      pregunta: pregunta,
      respuesta: respuesta,
    });

    if (!usuario) {
      logger.warn("Usuario no encontrado");
      return res.status(404).json({ message: "usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    logger.error(`Error en BuscaUsuarioByPreguntayRespuesta: ${error.message}`);
    res.status(404).send("ocurrio un error");
  }
};

exports.obtenerUsuarios = async (req, res) => {
  try {
    // Excluye el usuario con el rol "admin" de la consulta
    const usuarios = await Usuario.find({ rol: { $ne: "ADMIN" } });
    res.json(usuarios);
  } catch (error) {
    logger.error(`Error en obtenerUsuarios: ${error.message}`);
  }
};
exports.actualizarPasswordxCorreo = async (req, res) => {
  try {
    let { email } = req.body; // Corrección aquí
    let nuevaPassword = req.body.nueva;

    // Verificar si nuevaPassword está definido y no es una cadena vacía
    if (!nuevaPassword || typeof nuevaPassword !== "string") {
      logger.warn("La nueva contraseña es inválida");
      return res
        .status(400)
        .json({ message: "La nueva contraseña es inválida" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

    const usuario = await Usuario.findOne({ email: email });

    if (!usuario) {
      logger.warn("Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualiza la contraseña del usuario en la base de datos
    usuario.password = hashedPassword;
    await usuario.save();

    // Devuelve una respuesta exitosa
    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    logger.error(`Error en actualizarPasswordxCorreo: ${error.message}`);
    res
      .status(500)
      .json({ message: "Ocurrió un error al actualizar la contraseña" });
  }
};

exports.actualizarPasswordxPregunta = async (req, res) => {
  try {
    let { pregunta } = req.body.pregunta;
    let { respuesta } = req.body.respuesta;
    let nuevaPassword = req.body.nueva;

    // Verificar si nuevaPassword está definido y no es una cadena vacía
    if (!nuevaPassword || typeof nuevaPassword !== "string") {
      logger.warn("La nueva contraseña es inválida");
      return res
        .status(400)
        .json({ message: "La nueva contraseña es inválida" });
    }

    // Encripta la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

    // Busca el usuario por correo y token
    const usuario = await Usuario.findOne({
      pregunta: pregunta,
      respuesta: respuesta,
    });

    // Si no se encuentra el usuario, devuelve un mensaje de error
    if (!usuario) {
      logger.warn("Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualiza la contraseña del usuario en la base de datos
    usuario.password = hashedPassword;
    await usuario.save();

    // Devuelve una respuesta exitosa
    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    // Maneja los errores y devuelve una respuesta de error
    logger.error(`Error en actualizarPasswordxPregunta: ${error.message}`);
    res
      .status(500)
      .json({ message: "Ocurrió un error al actualizar la contraseña" });
  }
};

exports.listarSecretas = async (req, res) => {
  try {
    // Obtener todas las preguntas secretas
    const preguntas = await PreguntasSecretas.find();

    res.json(preguntas);
  } catch (error) {
    logger.error(`Error al obtener las preguntas secretas: ${error.message}`);
    res.status(500).json({ error: "Error al obtener las preguntas secretas" });
  }
};

// Ruta para actualizar el rol de un usuario
exports.actualizaRolUsuario = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  try {
    // Busca y actualiza el usuario en la base de datos
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { rol: rol },
      { new: true }
    );

    if (!usuarioActualizado) {
      logger.warn(`Usuario no encontrado: ${id}`);
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json({
      mensaje: "Rol actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    logger.error(`Error al actualizar el rol del usuario: ${error.message}`);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Ruta para actualizar el rol de un usuario
exports.actualizaDatos = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, longitud, latitud, telefono, numCasa, estatus } =
      req.body;

    let cliente = await Usuario.findById(req.params.id);
    if (!cliente) {
      logger.warn(`Usuario no encontrado: ${id}`);
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Actualiza el usuario con los datos proporcionados en el cuerpo de la solicitud
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { nombre, email, longitud, latitud, telefono, numCasa, estatus },
      { new: true }
    );

    res.status(200).json({
      mensaje: "Rol actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    logger.error(`Error al actualizar los datos del usuario: ${error.message}`);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
