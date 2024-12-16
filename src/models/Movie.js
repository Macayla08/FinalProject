const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genres: { type: [String], required: true },
  overview: { type: String },
  runtime: { type: Number },
  tagline: { type: String },
  cast: { type: [String] },
  director: { type: String }
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
