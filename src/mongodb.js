const mongoose = require("mongoose");

//mongoose.connect("mongodb://localhost:27017/450G1")
mongoose.connect("mongodb+srv://user:450G1@450g1.dguc5.mongodb.net/?retryWrites=true&w=majority&appName=450G1")
    .then(() => {
        console.log("connected to mongoDB");
    })
    .catch(() => {
        console.log("failed to connect to mongoDB");
    })

const LogInSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required: true
    },
	
	role: {
		type:String,
		enum: ['user', 'admin'], // Only allow 'user' or 'admin' as values
		default: 'user'
	},
	
	muted: {
		type: Boolean,
		default: false	
	},
	
	banned: {
		type: Boolean,
		default: false
	},
	
	email:{
        type:String,
        required:false
    },

    fullName:{
        type:String,
        required:false
    },
    age:{ 
        type:Number,
        required:false
    },

    bio:{ 
        type:String,
        required:false
    },
    gender:{ 
        type:String,
        required:false
    }
	
})

//create schema for each media type table
const MovieSchema = new mongoose.Schema({ 
    title: String, 
    director: String, 
    genres: String, 
    overview: String, 
    cast: [String], 
    runtime: Number, 
    poster_url: String });

const GameSchema = new mongoose.Schema({ 
    title: String, 
    developer: String, 
    genres: String, 
    platform: String, 
    rating: String,
    poster_url: String });

const BookSchema = new mongoose.Schema({ 
    title: String, 
    author: String, 
    num_pages: Number, 
    isbn: Number, 
    poster_url: String });

const ShowSchema = new mongoose.Schema({ 
    title: String, 
    description: String,
    cast: String, 
    duration: String, 
    rating: String, 
    genres: String,
    poster_url: String });

const SongSchema = new mongoose.Schema({
    title: String,
    genre: String,
    link: String,
    poster_url: String });

const RatingSchema = new mongoose.Schema({
    userID: mongoose.Schema.Types.ObjectId,
    mediaID: mongoose.Schema.Types.ObjectId,
    rating: Number
})

const collection = new mongoose.model("User Accounts", LogInSchema);
const movie_collection = new mongoose.model("movies", MovieSchema);
const game_collection = new mongoose.model("games", GameSchema);
const book_collection = new mongoose.model("books", BookSchema);
const show_collection = new mongoose.model("shows",ShowSchema);
const song_collection = new mongoose.model("songs",SongSchema);
const rating_collection = new mongoose.model("ratings",RatingSchema)

module.exports = { collection, movie_collection, game_collection, book_collection, show_collection, song_collection, rating_collection };