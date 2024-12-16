const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'TV Show' or 'Mini-Series'
  director: { type: String },
  cast: { type: [String] },
  rating: { type: Number },
  duration: { type: Number },
  listed_in: { type: [String] },
  description: { type: String }
});

const Show = mongoose.model('Show', showSchema);
module.exports = Show;
