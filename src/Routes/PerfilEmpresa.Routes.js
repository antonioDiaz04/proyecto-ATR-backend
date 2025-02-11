const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const {
  crearPerfilEmpresa,
  obtenerPerfilesEmpresa,
  editarPerfilEmpresa,
  guardarRedSocial,
  obtenerRedesSociales,
  eliminarAuditoria,
  eliminarRedSocial,editarConfigurarEmpresa,consultarConfigurarEmpresa
} = require("../Controllers/EmpresaController.js");

router.post(
  "/crearPerfilEmpresa",

  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  crearPerfilEmpresa
);

// Obtener todos los perfiles de empresa
router.get("/obtenerPerfilesEmpresa", obtenerPerfilesEmpresa);
router.get("/obtenerRedesSociales", obtenerRedesSociales);
router.get("/consultarConfigurarEmpresa", consultarConfigurarEmpresa);
router.post("/guardarRedSocial/:id", guardarRedSocial);
// router.put("/configurarEmpresa/", editarConfigurarEmpresa);

router.put(
  "/editarPerfilEmpresa",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  editarPerfilEmpresa
);
router.put("/editarConfigurarEmpresa", editarConfigurarEmpresa);
router.delete("/eliminarRedSocial/:id", eliminarRedSocial);

module.exports = router;
