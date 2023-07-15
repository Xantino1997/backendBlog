const mongoose = require('mongoose');
const { Schema, model } = mongoose;
mongoose.set('strictQuery', false)

const SuscriptorSchema = new Schema({

  name: String,
  email: {
    type: String,
    index: {
      unique: true,
      partialFilterExpression: { email: { $exists: true } }
    }
  },
  terms: {
    type: String,
    required: true
  }
});


const SuscriptorModel = model('Suscriptor', SuscriptorSchema);

module.exports = SuscriptorModel;
