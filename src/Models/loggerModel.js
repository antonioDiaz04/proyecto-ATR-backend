const mongoose = require("mongoose");
const auditMiddleware = require('../Midlewares/auditMiddleware');


const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  level: {
    type: String,
    required: true,
    enum: ["info", "warn", "error", "debug"], // Niveles de log permitidos
  },
  message: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
    enum: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Métodos HTTP permitidos
  },
  endpoint: {
    type: String,
    required: true,
  },
  queryParams: {
    type: mongoose.Schema.Types.Mixed, // Puede ser un objeto con parámetros de consulta
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // ID del usuario (si está autenticado)
    ref: "User", // Referencia al modelo de usuario (si lo tienes)
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed, // Cuerpo de la solicitud (puede ser un objeto)
  },
  responseStatus: {
    type: Number,
    required: true,
  },
  responseTime: {
    type: String,
    required: true,
  },
});
logSchema.plugin(auditMiddleware);

module.exports = mongoose.model('Log', logSchema);