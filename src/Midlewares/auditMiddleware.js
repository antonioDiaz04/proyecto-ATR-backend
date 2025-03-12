module.exports = function auditMiddleware(schema) {
    schema.post(['save', 'findOneAndUpdate', 'findOneAndDelete'], async function (doc) {
      const event = {
        save: 'CREATED',
        findOneAndUpdate: 'UPDATED',
        findOneAndDelete: 'DELETED',
      }[this.op];
  
      await Audit.create({ event, model: this.model.modelName, documentId: doc._id });
      console.log(`Evento registrado: ${event} - Modelo: ${this.model.modelName}`);
    });
  };