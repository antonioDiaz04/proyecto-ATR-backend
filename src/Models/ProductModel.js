const mongoose = require("mongoose");
const auditMiddleware = require('../Midlewares/auditMiddleware');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: false,
    trim: true,
  },
  imagenPrincipal: {
    type: String,
    required: true,
  },
  otrasImagenes: {
    type: [String], // Array de URLs de imágenes
    default: [],
  },
  categoria: {
    type: String,
    required: false,
    enum: ["venta", "renta"], // Ejemplo de categorías
  },
  color: {
    type: String,
    required: false,
  },
  textura: {
    type: String,
    required: false, // Puede ser opcional
  },

  talla: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL", "Otro"],
    required: false,
  },
  medidas: {
    altura: { type: Number, required: false }, // en cm
    cintura: { type: Number, required: false }, // en cm
  },
  precio: {
    type: Number,
    required: false,
    min: 0,
  },
  disponible: {
    type: Boolean,
    required: false,
    default: true,
  },
  
  nuevo: {
    type: Boolean, // Indica si es nuevo o usado
  },
  descripcion: {
    type: String,
    required: false,
    trim: true,
  },
  fechaCreacion: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
productoSchema.plugin(auditMiddleware);
module.exports = mongoose.model("Producto", productoSchema);
