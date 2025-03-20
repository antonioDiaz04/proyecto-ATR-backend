const Joi = require("joi");

const registerSchema = Joi.object({
  nombre: Joi.string().min(3).max(30).required(),
  telefono: Joi.string()
    .pattern(/^\+?[0-9\s]{10,15}$/) // Acepta números con o sin "+" y espacios
    .required(),
  email: Joi.string()
    .email()
    .pattern(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|info|biz|mx|us|uk|es|fr|de|ca|au|jp|xyz|me|tech|co|tv|cloud|ai)$/
    )
    .required(),
  password: Joi.string()
    .min(6)
    .pattern(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required(),
  captchaToken: Joi.optional(),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|info|biz|mx|us|uk|es|fr|de|ca|au|jp|xyz|me|tech|co|tv|cloud|ai)$/
    )
    .required(),
  password: Joi.string()
    .min(6)
    .pattern(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required(),
  captchaToken: Joi.optional(),
});
//a las politicas empresa, privacidad,

const DocumentosLegales = Joi.object({
  titulo: Joi.string().min(3).max(100).required(),
  contenido: Joi.string().min(10).required(),
  fechaVigencia: Joi.optional(),
});

module.exports = { registerSchema, loginSchema, DocumentosLegales };
