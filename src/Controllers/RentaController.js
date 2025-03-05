const Renta = require("../Models/RentaModel");
const Producto = require("../Models/ProductModel");
const { enviarNotificacion } = require("../utils/notificacion"); // Función para enviar notificación
const {logger} = require("../util/logger");

// Crear Nueva Renta desde Frontend
exports.crearRenta = async (req, res) => {
  try {
    const { 
      usuarioId,
      productoId, 
      fechaInicio, 
      fechaFin, 
      metodoPago,
      precioRenta,
      token // Token de notificación
    } = req.body;

    const producto = await Producto.findById(productoId);
    if (!producto) {
      logger.warn(`Producto con ID ${productoId} no encontrado`);
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const nuevaRenta = new Renta({
      usuario: usuarioId,
      producto: productoId,
      detallesRenta: {
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        duracionDias: calcularDiasDiferencia(fechaInicio, fechaFin)
      },
      detallesPago: {
        precioRenta: precioRenta,
        metodoPago: metodoPago
      },
      estado: 'Activo'
    });

    const rentaGuardada = await nuevaRenta.save();
    await Producto.findByIdAndUpdate(productoId, { $set: { disponibleParaRenta: false } });

    if (token) {
      await enviarNotificacion(token, 'Renta creada', 'Tu renta ha sido procesada con éxito.');
      logger.info(`Notificación enviada para la renta de producto ${productoId}`);
    }

    logger.info(`Renta creada con éxito para el producto ${productoId}`);
    res.status(201).json({ mensaje: 'Renta creada exitosamente', renta: rentaGuardada });
  } catch (error) {
    logger.error('Error en creación de renta:', error);
    res.status(500).json({ mensaje: 'Error al crear renta', error: error.message });
  }
};

// Listar Rentas de un Usuario Específico
exports.listarRentasUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const rentasUsuario = await Renta.find({ usuario: usuarioId })
      .populate('producto', 'nombre imagenPrincipal precio')
      .sort({ createdAt: -1 });

    logger.info(`Se encontraron ${rentasUsuario.length} rentas para el usuario ${usuarioId}`);
    res.status(200).json({ total: rentasUsuario.length, rentas: rentasUsuario });
  } catch (error) {
    logger.error('Error al listar rentas del usuario:', error);
    res.status(500).json({ mensaje: 'Error al listar rentas', error: error.message });
  }
};

// Cancelar Renta
exports.cancelarRenta = async (req, res) => {
  try {
    const { rentaId, token } = req.body;
    const { usuarioId } = req.body;

    const renta = await Renta.findById(rentaId);
    if (!renta) {
      logger.warn(`Renta con ID ${rentaId} no encontrada`);
      return res.status(404).json({ mensaje: 'Renta no encontrada' });
    }

    if (renta.usuario.toString() !== usuarioId) {
      logger.warn(`Usuario ${usuarioId} no autorizado para cancelar la renta ${rentaId}`);
      return res.status(403).json({ mensaje: 'No autorizado para cancelar esta renta' });
    }

    renta.estado = 'Cancelado';
    await renta.save();
    await Producto.findByIdAndUpdate(renta.producto, { $set: { disponibleParaRenta: true } });

    if (token) {
      await enviarNotificacion(token, 'Renta cancelada', 'Tu renta ha sido cancelada.');
      await enviarNotificacion(token, 'Renta cancelada', 'Tu renta ha sido cancelada.');
    }

    logger.info(`Renta con ID ${rentaId} cancelada exitosamente por el usuario ${usuarioId}`);
    res.status(200).json({ mensaje: 'Renta cancelada exitosamente' });
  } catch (error) {
    logger.error('Error al cancelar renta:', error);
    res.status(500).json({ mensaje: 'Error al cancelar renta', error: error.message });
  }
};

// Función para calcular días de diferencia
function calcularDiasDiferencia(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    logger.error('Error en las fechas proporcionadas para el cálculo de días');
    return 0; // Retorna 0 si hay un error en las fechas
  }

  return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
}

module.exports = { crearRenta, listarRentasUsuario, cancelarRenta };
