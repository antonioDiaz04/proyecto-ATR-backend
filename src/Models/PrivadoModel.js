const mongoose = require("mongoose");
const PoliticaNegocioSchema = mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  contenido: {
    type: String,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  version: {
    type: String,
    required: true,
    default: "1.0",
  },
  fechaVigencia: {
    type: Date,
    required: true,
  },
  estado: {
    type: String,
    enum: ["vigente", "no vigente", "eliminado"],
    default: "vigente",
  },
  historial: [
    {
      version: {
        type: String,
        required: true,
      },
      titulo: {
        type: String,
        required: true,
      },
      contenido: {
        type: String,
        required: true,
      },
      fechaVigencia: {
        type: Date,
        required: true,
      },
      estado: {
        type: String,
        enum: ["vigente", "no vigente", "eliminado"],
        default: "no vigente",
      },
      fechaCreacion: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const AcercaSchema = mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  contenido: {
    type: String,
    default: Date.now(),
  },
});

const PreguntaSchema = mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  contenido: {
    type: String,
    default: Date.now(),
  },
});

const ContactoSchema = mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  contenido: {
    type: String,
    default: Date.now(),
  },
});

const terminosYCondicionesSchema = mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  contenido: {
    type: String,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  version: {
    type: String,
    required: true,
    default: "1.0",
  },
  fechaVigencia: {
    type: Date,
    required: true,
  },
  estado: {
    type: String,
    enum: ["vigente", "no vigente", "eliminado"],
    default: "vigente",
  },
  historial: [
    {
      version: {
        type: String,
        required: true,
      },
      titulo: {
        type: String,
        required: true,
      },
      contenido: {
        type: String,
        required: true,
      },
      fechaVigencia: {
        type: Date,
        required: true,
      },
      estado: {
        type: String,
        enum: ["vigente", "no vigente", "eliminado"],
        default: "no vigente",
      },
      fechaCreacion: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const DeslindelegalSchema = mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  contenido: {
    type: String,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  version: {
    type: String,
    required: true,
    default: "1.0",
  },
  fechaVigencia: {
    type: Date,
    required: true,
  },
  estado: {
    type: String,
    enum: ["vigente", "no vigente", "eliminado"],
    default: "vigente",
  },
  historial: [
    {
      version: {
        type: String,
        required: true,
      },
      titulo: {
        type: String,
        required: true,
      },
      contenido: {
        type: String,
        required: true,
      },
      fechaVigencia: {
        type: Date,
        required: true,
      },
      estado: {
        type: String,
        enum: ["vigente", "no vigente", "eliminado"],
        default: "no vigente",
      },
      fechaCreacion: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = {
  Politicas: mongoose.model("Politicas", PoliticaNegocioSchema),
  TerminosYCondiciones: mongoose.model(
    "TerminosYCondiciones",
    terminosYCondicionesSchema
  ),
  Deslindelegal: mongoose.model("Deslindelegal", DeslindelegalSchema),
  AcercaDe: mongoose.model("AcercaDe", AcercaSchema),//
  Pregunta: mongoose.model("Pregunta", PreguntaSchema),//
  Contacto: mongoose.model("Contacto", ContactoSchema),//
};
