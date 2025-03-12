const mongoose = require('mongoose');

const auditMiddleware = require('../Midlewares/auditMiddleware');
const accesorioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: false,
    trim: true
  },
  imagenPrincipal: {
    type: String,
    required: true
  },
  estado: {
    disponible: {
      type: Boolean,
      required: false,
      default: true
    }
  }
});
accesorioSchema.plugin(auditMiddleware);
module.exports = mongoose.model('Accesorio', accesorioSchema);
