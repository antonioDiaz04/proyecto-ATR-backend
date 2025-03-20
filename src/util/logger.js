const { createLogger, format, transports } = require("winston");
const path = require("path");
const Log = require("../Models/loggerModel.js"); // Modelo de MongoDB donde se almacenarán los logs

// Función para formatear el log de la petición HTTP
const httpLogFormat = format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
    });
});

// Configuración del logger con Winston
const logger = createLogger({
    format: format.combine(
        format.timestamp(), // Obtener el tiempo
        httpLogFormat
    ),
    transports: [
        new transports.File({
          level: "warn",
            maxsize: 5120000, // Máximo 5MB por archivo
            maxFiles: 100, // Hasta 100 archivos históricos
            filename: path.join(__dirname, "../logs/log-api.log"), // Ruta del archivo de logs
        }),
    ],
});


const logHttpRequest = async (req, res, responseTime, level , message ) => {
    const { method, originalUrl, query, body, ip, headers } = req;
    const { statusCode } = res;

    const logData = {
        timestamp: new Date().toISOString(),
        level,
        message,
        method,
        endpoint: originalUrl,
        queryParams: query,
        userId: req.user ? req.user.id : null,
        ip,
        userAgent: headers["user-agent"],
        requestBody: body,
        responseStatus: statusCode,
        responseTime: `${responseTime}ms`,
    };

    try {
        // Guardar en MongoDB
        const logEntry = new Log(logData);
        await logEntry.save();
    } catch (error) {
        logger.error("Error al guardar log en MongoDB", { originalError: error.message });
    }

    // Guardar en archivo de logs
    logger.log(level, message, logData);
    
};

module.exports = { logger, logHttpRequest };
