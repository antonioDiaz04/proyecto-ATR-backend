const mongoose = require("mongoose");
const auditMiddleware = require('../Midlewares/auditMiddleware');

const RentaSchema = new mongoose.Schema({
  // Referencia a Usuario
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Usuarios", 
    required: true 
  },

  // Referencia a Producto
  producto: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Producto", 
    required: true 
  },

  // Detalles de Renta
  detallesRenta: {
    fechaInicio: { 
      type: Date, 
      required: true, 
      default: Date.now 
    },
    fechaFin: {  
      type: Date, 
      required: true 
    },
    duracionDias: { 
      type: Number, 
      required: true, 
      min: 1 
    }
  },
  // Estado de la Renta
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Activo', 'Completado', 'Cancelado'],
    default: 'Pendiente' 
  },

  // Detalles de Pago
  detallesPago: {
    precioRenta: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    metodoPago: { 
      type: String, 
      enum: ['Efectivo', 'Transferencia', 'Tarjeta', 'PayPal'],
      required: true 
    },
    fechaPago: { 
      type: Date, 
      default: Date.now 
    }
  },

  // Información Adicional
  notas: { 
    type: String, 
    maxlength: 500 
  },

  // Fechas de Registro
  fechaDeRegistro: { 
    type: Date, 
    default: Date.now() 
  }
});

// Middleware pre-save para validaciones
RentaSchema.pre("save", function(next) {
  // Validar que fecha fin sea posterior a fecha inicio
  if (this.detallesRenta.fechaFin <= this.detallesRenta.fechaInicio) {
    next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
  }
  next();
});

// Método para calcular duración
RentaSchema.methods.calcularDuracion = function() {
  const inicio = this.detallesRenta.fechaInicio;
  const fin = this.detallesRenta.fechaFin;
  const duracion = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
  return duracion;
};
RentaSchema.plugin(auditMiddleware);
const Renta = mongoose.model("Renta", RentaSchema);

module.exports = Renta;
