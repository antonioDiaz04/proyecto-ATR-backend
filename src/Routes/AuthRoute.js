const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jw = require("jsonwebtoken");
const AutController = require("../Controllers/AuthController");
const validarDatos = require("../Midlewares/validator.middleware");
const { loginSchema } = require("../schemas/authSchema");

router.post(
  "/signIn",
  // validarDatos(loginSchema),
  AutController.Login
);
router.post(
  "/signIn-Google-Facebook",
  AutController.registrarUsuarioConGoogleOFacebook
);

// router.post("/enviar-confirmar", AutController.enviarConfirmar);
// router.post("/verficar-codigo", AutController.verificarCodigo);

module.exports = router;
