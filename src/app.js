  const express = require("express");
  const morgan = require("morgan");
  require("dotenv").config();
  const conectarDB = require("./Server/Conexion");
  const cors = require("cors");
  const cookieParser = require("cookie-parser");
  const helmet = require("helmet");
  const { logHttpRequest } = require("./util/logger.js");
  const { limiter } = require("./util/rateLimit.js");

  const app = express();

  conectarDB();

  const corsOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim()) 
    : [];

  const corsOptions = {
    origin: corsOrigins.length > 0 ? corsOrigins : false, // Evita problemas si no hay orígenes definidos
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };

  app.use(helmet());
  app.use(cookieParser());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(limiter);
  app.use(helmet.hidePoweredBy()); // Oculta información del servidor
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
  app.use(helmet.noSniff());

  // Solo habilitar logging en desarrollo
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "trusted-scripts.com"],
        styleSrc: ["'self'", "trusted-styles.com"],
        imgSrc: ["'self'", "trusted-images.com"],
      },
    })
  );

  // Configura X-Frame-Options para prevenir Clickjacking
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    next();
  });

  app.use((req, res, next) => {
    const blockedIPs = ["169.254.169.254", "::ffff:169.254.169.254"];
    const clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;

    if (blockedIPs.includes(clientIP)) {
      console.warn(`🔴 Intento de acceso bloqueado desde ${clientIP}`);
      return res.status(403).send("Acceso denegado");
    }
    next();
  });


  app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://apis.google.com"],
            styleSrc: ["'self'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
        }
    },
    xssFilter: true, // Protege contra ataques de XSS
    frameguard: { action: "deny" }, // Bloquea el uso en iframes
    noSniff: true // Evita la detección automática de MIME types
  }));

  // Solo habilitamos los mensajes por consola en el modo de desarrollo
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });


  app.use((req, res, next) => {
    res.removeHeader("X-Powered-By"); // Elimina el encabezado que revela la tecnología del servidor
    next();
  });
  app.use((req, res, next) => {
    const start = Date.now(); //Se captura el tiempo actual en milisegundos
    res.on("finish", () => {
      const ip = req.ip;
      console.log(ip)
      const duration = Date.now() - start; // se calcula la duración de la solicitud restando el tiempo actual
      logHttpRequest(req, res, duration);
    });
    next();
  });

  // Ruta dinámica para la API
  const apiVersion = process.env.API_VERSION || "v1"; // Si no se define, usa 'v1'

  // Rutas padres
  app.use(`/api/${apiVersion}/msj`, require("./Routes/WhatsappRoute.js"));
  app.use(`/api/${apiVersion}/producto`, require("./Routes/ProductRoute"));
  app.use(`/api/${apiVersion}/accesorio`, require("./Routes/AccesorioRoute.js"));
  app.use(
    `/api/${apiVersion}/vestidos-accesorios`,
    require("./Routes/VestidoAccesorioRoute.js")
  );

  app.use(
    `/api/${apiVersion}/enviar-notificacion`,
    require("./Routes/NotificacionRoute")
  );
  app.use(`/api/${apiVersion}/enviar-correo`, require("./Routes/CorreoRoute"));
  app.use(`/api/${apiVersion}/verificacion`, require("./Routes/CorreoRoute"));
  app.use(`/api/${apiVersion}/verificar`, require("./Routes/catpch"));

  app.use(`/api/${apiVersion}/Empresa`, require("./Routes/PerfilEmpresa.Routes"));
  app.use(`/api/${apiVersion}/autentificacion`, require("./Routes/AuthRoute"));
  app.use(`/api/${apiVersion}/renta`, require("./Routes/Renta&Venta"));
  app.use(
    `/api/${apiVersion}/estadisticas`,
    require("./Routes/EstadisticasRoute")
  );

  // Ruta para acciones control de Administrador de la página
  app.use(`/api/${apiVersion}/admin`, require("./Routes/PrivadoRoute"));
  app.use(`/api/${apiVersion}/politicas`, require("./Routes/PoliticasRoute.js"));

  // Ruta para acciones con rol de Administrador
  app.use(`/api/${apiVersion}/usuarios`, require("./Routes/UsuarioRoute"));

  app.use((req, res, next) => {
    ["X-Powered-By", "Date"].forEach(header => res.removeHeader(header));
    next();
  });


  module.exports = app;
