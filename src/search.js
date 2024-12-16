const express = require('express');
const path = require('path');
const hbs = require("hbs");
const router = express.Router();
const {Book, Game, Movie, Show, Song} = require("./mediaDB");
const templatePath = path.join(__dirname, "../templates");



router.get("/search", (req, res) => {
    res.render("search");
})
router.get('/search-results', async(req,res)=>{
    const search = req.query.searchTerm;
    const mediatype = req.query.mediaType;
    let results;
    //if statements to find which table to search
    try {
        if (mediatype === 'Movie') {
            results = await Movie.find({ title: new RegExp(search, 'i') }).select('title runtime _id').exec();

        } else if (mediatype === 'Song') {
            results = await Song.find({ song_name: new RegExp(search, 'i') }).select('song_name genre _id').exec();
        } else if (mediatype === 'Book')
         {
            results = await Book.find({ title: new RegExp(search, 'i') }).select('title authors _id').exec();
        } else if (mediatype === 'Game')
             {
            results = await Game.find({ Name: new RegExp(search, 'i') }).select('Name Genre _id').exec();
        } else if (mediatype === 'Show') 
            {
            results = await Show.find({ title: new RegExp(search, 'i') }).select('title duration _id').exec();
        }

        if (req.xhr) {
            return res.json(results);
        } else {
            res.render('searchResults', { results });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }   
});

module.exports = router;
