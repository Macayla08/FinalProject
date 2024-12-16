const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: { type: String, required: true },
  isbn13: { type: String, required: true },
  num_pages: { type: Number, required: true }
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
