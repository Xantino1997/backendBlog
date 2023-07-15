const mongoose = require('mongoose');
const { Schema, model } = mongoose;
mongoose.set('strictQuery', false);

const DesuscriptorSchema = new Schema({
  name: String,
  email: {
    type: String,
    index: {
      unique: true,
      partialFilterExpression: { email: { $exists: true } }
    }
  },
});

const DesuscriptorModel = model('Desuscriptor', DesuscriptorSchema);
module.exports = DesuscriptorModel;
