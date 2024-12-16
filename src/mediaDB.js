const mongoose = require("mongoose");



const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,  
    },
    num_pages: {
        type: Number,
        required: true, 
    },
    authors: {
        type: String,
        required: true, 
    },
    isbn13: {
        type: String,
        required: true,  
    }
});

const Book = mongoose.model('book', bookSchema);

const gameSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,  
    },
    Platform: {
        type: String,
        required: true, 
    },
    Genre: {
        type: String,
        required: true,  
    },
    Rating:{
        type: String,
        required: true,  
    },
    Developer:{
        type: String,
        required: true,  
    },
});

const Game = mongoose.model('game', gameSchema);

const movieSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,  
    },
    runtime: {
        type: Number,
        required: true,  
    },
    director: {
        type: String,
        required: true, 
    },
    genres: {
        type: String,
        required: true, 
    },
    overview: {
        type: String,
        required: true, 
    },
    cast: {
        type: String,
        required: true, 
    },
    tagline: {
        type: String,
        required: true,
    }
});

const Movie = mongoose.model('movie', movieSchema);

const showSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,  
    },
    type: {
        type: String,
        required: true,  
    },
    cast: {
        type: String,
        required: true, 
    },
    duration: {
        type: String,
        required: true,  
    },
    description: {
        type: String,
        required: true,  
    },
    listed_in: {
        type: String,
        required: true,  
    },
    director:{
        type: String,
        required:true,
    },
    rating:{
        type: String,
        required:true,
    }
});

const Show = mongoose.model('show', showSchema);

const songSchema = new mongoose.Schema({

    song_name: {
        type: String,
        required: true,  
    },
    track_href: {
        type: String,
        required: true,  
    },
    genre: {
        type: String,
        required: true, 
    }
});

const Song = mongoose.model('song', songSchema);

module.exports={
    Book,
    Game,
    Movie,
    Show,
    Song
};
