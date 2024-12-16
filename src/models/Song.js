const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  song_name: { type: String, required: true },
  genre: { type: String, required: true },
  track_href: { type: String, required: true }
});

const Song = mongoose.model('Song', songSchema);
module.exports = Song;
