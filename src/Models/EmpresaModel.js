const mongoose = require("mongoose");
const auditMiddleware = require('../Midlewares/auditMiddleware');

const DatosAtelierSchema = mongoose.Schema({
  logo: {
    type: String,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  redesSociales: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RedesSociales", // Referencia al modelo RedesSociales
    },
  ],
  slogan: {
    type: String,
    maxlength: 100, // Límite de caracteres
  },
  tituloPagina: {
    type: String,
    maxlength: 60, // Límite de caracteres para el título de página
  },
  direccion: {
    type: String,
    required: true,
  },
  correoElectronico: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
  },
});

const redesSocialesSchema = mongoose.Schema([
  {
    plataforma: {
      type: String,
      required: true,
    },
    enlace: {
      type: String,
      required: true,
    }
  },
]);
DatosAtelierSchema.plugin(auditMiddleware);
redesSocialesSchema.plugin(auditMiddleware);

module.exports = {
  DatosAtelier: mongoose.model("DatosAtelier", DatosAtelierSchema),
  RedesSociales: mongoose.model("RedesSociales", redesSocialesSchema),
};
