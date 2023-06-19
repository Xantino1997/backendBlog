
const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const eventSchema = new mongoose.Schema({
  title: String,
  image: String,
  description: String,
  eventDate: Date,
});

const eventModel = model('Events', eventSchema);

module.exports = eventModel;