const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuración de almacenamiento en disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define la ruta donde se guardarán los archivos subidos
    const uploadPath = path.join(__dirname, "../uploads");

    // Verifica si la carpeta de destino existe. Si no, la crea.
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); //  permite crear carpetas anidadas si es necesario
    }

    // Llama al callback con la ruta de destino
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    // Define el nombre del archivo. Se usa un timestamp para evitar colisiones.
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Filtro de archivos para permitir solo ciertos tipos
const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos: JPEG y PNG
  const allowedTypes = ["image/jpeg", "image/png"];

  // Verifica si el tipo MIME del archivo está en la lista de permitidos
  if (allowedTypes.includes(file.mimetype)) {
    // Si el archivo es permitido, llama al callback con `true`
    cb(null, true);
  } else {
    // Si el archivo no es permitido, llama al callback con un error
    cb(new Error("Tipo de archivo no permitido. Solo JPEG o PNG."), false); // <-- El archivo es rechazado.
  }
};

// Configuración de `multer`
const upload = multer({
  storage, // Usa la configuración de almacenamiento definida
  fileFilter, // Usa el filtro de archivos definido
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de tamaño de archivo: 5 MB
  },
});

module.exports = upload;