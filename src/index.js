//Admin calls begin on Line 103
//Media Page calls begin on Line 516
//Rating logic at 723
//Webpage initialization using express, hbs
//const path and path.join allow for indirect calls to the site from directories above
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const hbs = require("hbs");
const { collection, movie_collection, game_collection, book_collection, show_collection, song_collection, rating_collection } = require("./mongodb");
const SRoutes = require("./search");
const templatePath = path.join(__dirname, "../templates");
const session = require('express-session');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const sanitize = require('./sanitize');
//const Book = require('./models/Book');
//const Game = require('./models/Game');
//const Movie = require('./models/Movie');
//const Show = require('./models/Show');
//const Song = require('./models/Song');

const {Book, Game, Movie, Show, Song} = require("./mediaDB");


//Middleware setup
app.use(express.json());
app.use('/', SRoutes);
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({extended:true}))
app.use(session({
	secret: 'shh',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}));
app.use(router);
app.use(express.static(path.join(__dirname, "../public")));

// declares the eq function for use in hbs files (yes, really)
hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

//checks if the logged in user is an admin
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).send('Access denied');
}


//direct users to login page on initial request
app.get("/", (req, res) => {
    res.render("login");
})


//signup page
app.get("/signup", (req, res) => {
    res.render("signup");
})

app.post("/signup",async (req, res) => {
	const {username, password } = req.body;
    const data = {
        username: sanitize(req.body.username),
        password:sanitize(req.body.password),
		role: 'user'
    };

    //saves new user to mongoDB
    const new_users = await collection.insertMany([data]);
    const new_user=new_users[0];

    req.session.user ={
        _id: new_user.id,
        username: new_user.username,
        fullName: new_user.fullName,
        email: new_user.email,
        bio: new_user.bio,
        age: new_user.age
    };

    res.redirect("/home")

});


//login page
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    
    try {
		const Username = sanitize(req.body.username);
        const Password = sanitize(req.body.password);
        const check = await collection.findOne({ username: Username })
        if (check.password === Password) {
			if (check.banned) {
				// If the user is banned, show a banned message
				return res.send("You have been banned from accessing this site.");
			}		
            req.session.user ={
                _id: check.id,
                username: check.username,
                fullName: check.fullName,
                email: check.email,
                bio: check.bio,
                age: check.age,
				        role: check.role,
				        muted: check.muted,
				        banned: check.banned,
            };
			      res.redirect("/home")
        }
        else {
            res.send("Incorrect username/password")
        }
    }
    catch {
        res.send("Error processing request")
    }

    

});

//FAQ Page Route
app.get("/faq", async (req, res) => {
    res.render("faq");
})


//HOME and PROFILE Routes
app.get('/home', async (req, res) => {
    if (req.session.user) {
      console.log('opened');
      try {
          const mediaCollections = [Movie, Game, Book, Song, Show];
          const randomCollection = mediaCollections[Math.floor(Math.random() * mediaCollections.length)];

          console.log('Selected Collection:', randomCollection.modelName);

          const count = await randomCollection.countDocuments();
          console.log('Total Count:', count);
          const randomIndex = Math.floor(Math.random() * count);
          const randomMedia = await randomCollection.findOne().skip(randomIndex);
          console.log('Random Media:', randomMedia);
          if (randomMedia) {
            randomMedia.mediaType = randomCollection.modelName  // Convert to lowercase here
          }

          res.render('home', { 
              user: req.session.user.username,
              media: randomMedia || null
          });
      } catch (error) {
          console.error('Error fetching random media:', error);
          res.render('home', { 
              user: req.session.user.username, 
              media: null 
          });
      }
  } else {
      res.redirect('/login');
  }
});



app.get('/profile', async(req,res)=> {
    if (req.session.user) {
        const user = req.session.user;
        res.render('user', {
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          bio: user.bio,
          age: user.age,
          gender: user.gender
        });
      } else {
        res.status(401).send('Unauthorized');
      }
}
)

app.post('/update-profile', async(req,res) => {
    const user = req.session.user;
    console.log(req.body.name);
    

    if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const updatedData = {};

    // Update fields only if new value is provided (not an empty string or undefined)
    if (req.body.name && typeof req.body.name === 'string' && req.body.name.trim() !== '') {
        updatedData.fullName = sanitize(req.body.name.trim());
        req.session.user.fullName = updatedData.fullName;
    }
    if (req.body.email && typeof req.body.email === 'string') {
        updatedData.email = sanitize(req.body.email.trim());
        req.session.user.email = updatedData.email;
    }
    if (req.body.gender) {updatedData.gender = req.body.gender;
        req.session.user.gender = req.body.gender;}

    if (req.body.age && !isNaN(req.body.age) && req.body.age > 0) {
        updatedData.age = parseInt(req.body.age, 10);
        req.session.user.age = req.body.age;
    }
    if (req.body.bio && typeof req.body.bio === 'string') {
        updatedData.bio = sanitize(req.body.bio.trim());
        req.session.user.bio = updatedData.bio;
    }

    

    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(user._id)},
            { $set: updatedData }
        );


    console.log('Update result:', result);
    if (result.modifiedCount > 0) {
        res.redirect('/profile');
    } else {
        res.redirect('/profile');

    }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }


});

app.post('/delete', async (req, res) => {
    console.log("entered");
    try {
        if (!req.session.user) {
            return res.status(401).send('Unauthorized');
        }
        
        await collection.deleteOne({_id: req.session.user._id});
        req.session.destroy(); // Ensure to log out the user if using a session-based strategy
        console.log("Deletion Complete");
        res.redirect('/login'); // Redirect to a goodbye or homepage after deletion
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).send('An error occurred');
    }
});

//ADMIN users --------------------------------------------------------------------------------------------------------

// get admin page with list of users
router.get('/admin', isAdmin, async (req, res) => {
  try {
	  // grabs all users from mongodb
    const users = await collection.find();
    res.render('admin', { users });
  } catch (err) {
		res.status(500).send('Error fetching users');
  }
});

// GET route to edit a user
router.get('/admin/edit/:id', isAdmin, async (req, res) => {
  try {
    const user = await collection.findById(req.params.id);
    res.render('edit-user', { user }); // Render the edit page for a specific user
  } catch (err) {
    res.status(500).send('Error fetching user data');
  }
});

// POST route to update a user
router.post('/admin/edit/:id', isAdmin, async (req, res) => {
  try {
    const updatedUser = await collection.findByIdAndUpdate(req.params.id, {
      username: req.body.username,
      password: req.body.password, // Ensure to hash the password if updating it
    }, { new: true });

    res.redirect('/admin'); // Redirect back to the admin page
  } catch (err) {
    res.status(500).send('Error updating user');
  }
});

// POST route to edit a user's role
router.post('/admin/edit-role/:id', isAdmin, async (req, res) => {
    try {
        const { role } = req.body; // Get the role from the form

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).send('Invalid role');
        }

        const updatedUser = await collection.findByIdAndUpdate(req.params.id, {
            role: role // Update role here
        }, { new: true });

        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Error updating user role');
    }
});

// Mute Route (toggle mute/unmute)
app.post('/admin/mute/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await collection.findById(userId);
        
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Toggle mute status
        user.muted = !user.muted; // If muted is true, it will set it to false (unmute)
        await user.save();

        // Redirect back to the admin page
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Ban Route (toggle ban/unban)
app.post('/admin/ban/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await collection.findById(userId);
        
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Toggle ban status
        user.banned = !user.banned; // If banned is true, it will set it to false (unban)
        await user.save();

        // Redirect back to the admin page
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST route to delete a user
router.post('/admin/delete/:id', isAdmin, async (req, res) => {
  try {
    await collection.findByIdAndDelete(req.params.id);
    res.redirect('/admin'); // Redirect to the admin page after deletion
  } catch (err) {
    res.status(500).send('Error deleting user');
  }
});

//ADMIN books --------------------------------------------------------------------------------------------------------

// Admin route for managing books
router.get('/admin/books', isAdmin, async (req, res) => {
  try {
    const books = await Book.find();  // Fetch all books from the database
    res.render('admin-books', { books });  // Render the admin view for books
  } catch (err) {
    res.status(500).send('Error fetching books');
  }
});

// Route to edit a specific book
router.get('/admin/edit-book/:id', isAdmin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);  // Find book by ID
    res.render('edit-book', { book });  // Render the edit form for the specific book
  } catch (err) {
    res.status(500).send('Error fetching book data');
  }
});

// Route to update a book
router.post('/admin/edit-book/:id', isAdmin, async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      authors: req.body.authors,
      isbn13: req.body.isbn13,
      num_pages: req.body.num_pages
    }, { new: true });

    res.redirect('/admin/books');  // Redirect to the books admin page after update
  } catch (err) {
    res.status(500).send('Error updating book');
  }
});

// Admin route to add a new book
router.post('/admin/add-book', isAdmin, async (req, res) => {
  try {
    const newBook = new Book({
      title: req.body.title,
      authors: req.body.authors,
      isbn13: req.body.isbn13,
      num_pages: req.body.num_pages
    });

    await newBook.save();
    res.redirect('/admin/books');  // Redirect back to the books list
  } catch (err) {
    res.status(500).send('Error adding book');
  }
});

// Route to delete a book
router.post('/admin/delete-book/:id', isAdmin, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);  // Delete the book from the database
    res.redirect('/admin/books');  // Redirect back to the books admin page
  } catch (err) {
    res.status(500).send('Error deleting book');
  }
});

//ADMIN games --------------------------------------------------------------------------------------------------------

// Admin route for managing games
router.get('/admin/games', isAdmin, async (req, res) => {
  try {
    const games = await Game.find();
    res.render('admin-games', { games });
  } catch (err) {
    res.status(500).send('Error fetching games');
  }
});

// Route to edit a specific game
router.get('/admin/edit-game/:id', isAdmin, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    res.render('edit-game', { game });
  } catch (err) {
    res.status(500).send('Error fetching game data');
  }
});

// Route to update a game
router.post('/admin/edit-game/:id', isAdmin, async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, {
      Name: req.body.Name,
      Platform: req.body.Platform,
      Genre: req.body.Genre
    }, { new: true });

    res.redirect('/admin/games');
  } catch (err) {
    res.status(500).send('Error updating game');
  }
});

// Route to render Add Game Form
router.get('/admin/add-game', isAdmin, (req, res) => {
  res.render('add-game'); // You'll need to create the add-game.hbs template for this form.
});

// Route to delete a game
router.post('/admin/delete-game/:id', isAdmin, async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.redirect('/admin/games');
  } catch (err) {
    res.status(500).send('Error deleting game');
  }
});

//ADMIN movies --------------------------------------------------------------------------------------------------------

// Admin route for managing movies
router.get('/admin/movies', isAdmin, async (req, res) => {
  try {
    const movies = await Movie.find(); // Fetch all movies from the database
    res.render('admin-movies', { movies }); // Render the admin view for movies
  } catch (err) {
    res.status(500).send('Error fetching movies');
  }
});

// Route to edit a specific movie
router.get('/admin/edit-movie/:id', isAdmin, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id); // Find movie by ID
    res.render('edit-movie', { movie }); // Render the edit form for the specific movie
  } catch (err) {
    res.status(500).send('Error fetching movie data');
  }
});

// Route to update a movie
router.post('/admin/edit-movie/:id', isAdmin, async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      director: req.body.director,
      genres: req.body.genres,
      release_date: req.body.release_date,
      runtime: req.body.runtime,
      description: req.body.description
    }, { new: true });

    res.redirect('/admin/movies'); // Redirect to the movies admin page after update
  } catch (err) {
    res.status(500).send('Error updating movie');
  }
});

// Route to delete a movie
router.post('/admin/delete-movie/:id', isAdmin, async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id); // Delete the movie from the database
    res.redirect('/admin/movies'); // Redirect back to the movies admin page
  } catch (err) {
    res.status(500).send('Error deleting movie');
  }
});

// Route to add a new movie
router.get('/admin/add-movie', isAdmin, (req, res) => {
  res.render('add-movie'); // Render the form to add a new movie
});

// Route to submit the form to add a new movie
router.post('/admin/add-movie', isAdmin, async (req, res) => {
  try {
    const newMovie = new Movie({
      title: req.body.title,
      director: req.body.director,
      genres: req.body.genres,
      release_date: req.body.release_date,
      runtime: req.body.runtime,
      description: req.body.description
    });

    await newMovie.save(); // Save the new movie to the database
    res.redirect('/admin/movies'); // Redirect to the movies admin page
  } catch (err) {
    res.status(500).send('Error adding movie');
  }
});

//ADMIN shows --------------------------------------------------------------------------------------------------------

// Admin route for managing shows
router.get('/admin/shows', isAdmin, async (req, res) => {
  try {
    const shows = await Show.find();
    res.render('admin-shows', { shows });
  } catch (err) {
    res.status(500).send('Error fetching shows');
  }
});

// Route to edit a specific show
router.get('/admin/edit-show/:id', isAdmin, async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    res.render('edit-show', { show });
  } catch (err) {
    res.status(500).send('Error fetching show data');
  }
});

// Route to update a show
router.post('/admin/edit-show/:id', isAdmin, async (req, res) => {
  try {
    const { title, description, cast, rating, duration, listed_in } = req.body;
    
    const updatedShow = await Show.findByIdAndUpdate(req.params.id, {
      title,
      description,
      cast,
      rating,
      duration,
      listed_in
    }, { new: true });

    res.redirect('/admin/shows');
  } catch (err) {
    res.status(500).send('Error updating show');
  }
});

// Route to delete a show
router.post('/admin/delete-show/:id', isAdmin, async (req, res) => {
  try {
    await Show.findByIdAndDelete(req.params.id);
    res.redirect('/admin/shows');
  } catch (err) {
    res.status(500).send('Error deleting show');
  }
});

// Route to render the add-show form
router.get('/admin/add-show', isAdmin, (req, res) => {
  res.render('add-show');
});

// Route to handle the add-show form submission
router.post('/admin/add-show', isAdmin, async (req, res) => {
  try {
    const { title, description, cast, rating, duration, listed_in } = req.body;

    const newShow = new Show({
      title,
      description,
      cast,
      rating,
      duration,
      listed_in
    });

    await newShow.save();
    res.redirect('/admin/shows');
  } catch (err) {
    res.status(500).send('Error adding show');
  }
});

//ADMIN songs --------------------------------------------------------------------------------------------------------

// Admin route for managing songs
router.get('/admin/songs', isAdmin, async (req, res) => {
  try {
    const songs = await Song.find();
    res.render('admin-songs', { songs });
  } catch (err) {
    res.status(500).send('Error fetching songs');
  }
});

// Route to edit a specific song
router.get('/admin/edit-song/:id', isAdmin, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    res.render('edit-song', { song });
  } catch (err) {
    res.status(500).send('Error fetching song data');
  }
});

// Route to update a song
router.post('/admin/edit-song/:id', isAdmin, async (req, res) => {
  try {
    const { song_name, artist, genre, track_href, poster } = req.body;

    const updatedSong = await Song.findByIdAndUpdate(req.params.id, {
      song_name,
      artist,
      genre,
      track_href,
      poster
    }, { new: true });

    res.redirect('/admin/songs');
  } catch (err) {
    res.status(500).send('Error updating song');
  }
});

// Route to delete a song
router.post('/admin/delete-song/:id', isAdmin, async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.id);
    res.redirect('/admin/songs');
  } catch (err) {
    res.status(500).send('Error deleting song');
  }
});

// Route to render the add-song form
router.get('/admin/add-song', isAdmin, (req, res) => {
  res.render('add-song');
});

// Route to handle adding a song
router.post('/admin/add-song', isAdmin, async (req, res) => {
  try {
    const { song_name, artist, genre, track_href, poster } = req.body;

    const newSong = new Song({
      song_name,
      artist,
      genre,
      track_href,
      poster
    });

    await newSong.save();
    res.redirect('/admin/songs');
  } catch (err) {
    res.status(500).send('Error adding song');
  }
});

//ADMIN end --------------------------------------------------------------------------------------------------------

//Rating logic

const getUserRating = async (userId, mediaId) => { 
    const userRating = await rating_collection.findOne({ 
        userID: new ObjectId(userId), 
        mediaID: new ObjectId(mediaId) 
    }); 
    
    return userRating ? userRating.rating : ''; 
};

const getAverageRating = async (mediaId) => { 
    const rating = await rating_collection.aggregate([ 
        { $match: { mediaID: new ObjectId(mediaId) } }, 
        { $group: { _id: "$mediaID", averageRating: { $avg: "$rating" } } } ]); 
        
        return rating.length > 0 ? rating[0].averageRating : 'N/A'; 
};

app.post("/rate_media/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const { rating } = req.body;
	  
	   // Check if user is muted
	  const userId = req.session.user._id;
      const user = await collection.findOne({ _id: new ObjectId(userId) });
      if (user && user.muted) {
          return res.status(403).send({ message: "You are muted and cannot submit a rating." });
      }

      if (rating < 1 || rating > 10) {
          return res.status(400).send({ message: "Rating must be between 1 and 10." });
      }

      const newRating = new rating_collection({
          mediaID: new mongoose.Types.ObjectId(id),
          rating: parseInt(rating, 10)
      });
      
      console.log("Inserting new rating:", newRating);
      
      await newRating.save(); // Use Mongoose's `save` method for models
      

      res.send({ message: "Rating submitted successfully!" });
  } catch (error) {
      console.error("Error submitting rating:", error);
      res.status(500).send({ message: "Error submitting rating" });
  }
});


//MEDIA PAGES BEGIN

//call media pages 
app.get('/movie/:id', async (req, res) => {
    try {

      const movieID = req.params.id
        const movie = await Movie.findById(movieID).exec();
        const avgRating = await getAverageRating(req.params.id);

        if (movie) { 
            res.render("movie", { 
                title: movie.title, 
                creator: movie.director, 
                genre: movie.genres, 
                description: movie.overview, 
                cast_list: movie.cast,
                tagline: movie.tagline,
                runtime: movie.runtime,
                poster: movie.poster_url,
                avgRate: avgRating
             }); } 
        else { 
            res.status(404).send("Movie not found");
        }
    } catch (error) { 
        console.error("Error retrieving movie data:", error);
        res.status(500).send("Error retrieving movie data");
    }
});
app.get('/show/:id', async (req, res) => {
    try {
        const showId = req.params.id;
        const show = await Show.findById(showId).exec(); 
        const avgRating = await getAverageRating(req.params.id);

        if (!show) {
            return res.status(404).send('Show not found');
        }

        // Render the movie.hbs template with the movie data
        res.render('show', {
            title: show.title,
            listed_in: show.listed_in,
            description: show.description,
            cast_list: show.cast,
            poster: show.poster,
            rating: show.rating,
            duration: show.duration,
            avgRate: avgRating
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.get('/game/:id', async (req, res) => {
    try {
        const gameId = req.params.id;
        const game = await Game.findById(gameId).exec(); 
        const avgRating = await getAverageRating(req.params.id);

        if (!game) {
            return res.status(404).send('Game not found');
        }

        // Render the movie.hbs template with the movie data
        res.render('game', {
            title: game.Name,
            creator: game.Developer,
            genre: game.Genre,
            platform: game.Platform,
            poster: game.poster,
            rating: game.Rating,
            runtime: game.runtime,
            avgRate: avgRating
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.get('/song/:id', async (req, res) => {
    try {
        const songId = req.params.id;
        const song = await Song.findById(songId).exec();
        const avgRating = await getAverageRating(req.params.id);

        if (!song) {
            return res.status(404).send('Song not found');
        }

        // Render the movie.hbs template with the movie data
        res.render('song', {
            title: song.song_name,
            genre: song.genre,
            avgRate: avgRating
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.get('/book/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await Book.findById(bookId).exec(); 
        const avgRating = await getAverageRating(req.params.id);

        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Render the movie.hbs template with the movie data
        res.render('book', {
            title: book.title,
            creator: book.authors,
            poster: book.poster,
            isbn: book.isbn13,
            num_pages: book.num_pages,
            avgRate: avgRating
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

//api grab
//app.get('/api', (req, res) => {
//    res.json('HTTP GET request recieved');})

//react integration
//app.use('/', express.static(path.join(__dirname, '/react-app/build')));

//app.use('/website', express.static(path.join(__dirname, '/public')));

//HTML 404 page, handles invalid requests

app.use((req, res) => {
    res.status(404);
    res.send('<h1>Error 404: Page not found.</h1>');
})


//set website port on local address
app.listen(3000, () => {
    console.log("App listening on port 3000");
})

module.exports = router;

//run 'node src/index' to start. Will host on localhost:3000
