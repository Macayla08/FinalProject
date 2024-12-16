const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Platform: { type: String, required: true },
  Genre: { type: String, required: true }
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;
