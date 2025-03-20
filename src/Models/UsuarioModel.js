const mongoose = require("mongoose");

const EstadoCuentaSchema = mongoose.Schema({
  estado: { type: String, default: "activa" },
  intentosFallidos: { type: Number, required: true, default: 0 },
  fechaUltimoIntentoFallido: { type: Date },
  vecesDeBloqueos: { type: Number, default: 0 },
  fechaDeUltimoBloqueo: { type: Date },
  intentosPermitidos: { type: Number, default: 5 },
  tiempoDeBloqueo: { type: Number, default: 30 },
});

const UsuarioSchema = mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, unique: true, required: false },
  telefono: { type: String },
  token: { type: String, required: false },
  codigoVerificacion: { type: String, required: false },
  verificado: { type: Boolean, required: false },
  rol: {
    type: String,
    required: false,
    default: "CLIENTE",
  },
  password: { type: String, required: false, default: "" },
  fechaDeRegistro: { type: Date, default: Date.now() },
  estadoCuenta: { type: mongoose.Schema.Types.ObjectId, ref: "EstadoCuenta" },
});

const EstadoCuenta = mongoose.model("EstadoCuenta", EstadoCuentaSchema);
const Usuario = mongoose.model("Usuarios", UsuarioSchema);

//  Middleware pre-save para limpiar el número de teléfono
UsuarioSchema.pre("save", function (next) {
  if (this.telefono) {
    // Remover espacios del número de teléfono
    this.telefono = this.telefono.replace(/\s+/g, "");
  }
  next();
});

module.exports = {
  Usuario,
  EstadoCuenta,
};
