// Dependencies
var express = require('express');
// set handlebars
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');

var db = require('./models');

var PORT = process.env.PORT || 8080;

var app = express();

// Use morgan logger for logging requests
app.use(logger('dev'));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static('public'));
app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    log: function(something) {
      console.log(something);
    }
  })
);
app.set('view engine', 'handlebars');
// Connect to the Mongo DB
// mongoose.connect('mongodb://localhost/articleScraper', {
//   useNewUrlParser: true
// });

var MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost/articleScraper';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
// mongoose.set('useFindAndModify', false);

// Routes

// Route for displaying the homepage
app.get('/', function(req, res) {
  res.render('index');
});

// GET route for scraping - scrape works - need summary
app.get('/scrape', function(req, res) {
  axios.get('https://www.reviewjournal.com/').then(function(response) {
    var $ = cheerio.load(response.data);

    $('article.post').each(function(i, element) {
      var result = {};

      result.title = $(this)
        .find('div.entry-title')
        .text();

      result.link = $(this)
        .find('div.entry-title')
        .children()
        .attr('href');

      result.summary = $(this)
        .find('div.field-excerpt p')
        .text();

      // Create a new article
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(result);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    // If articles were scraped let the client know
    res.send('Scrape Complete');
  });
});

// Route for getting all articles from the DB - WORKS!! ✅
app.get('/articles', function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for getting all saved articles
app.get('/saved', function(req, res) {
  db.Article.find({ saved: true })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// route for updating an article to be marked as saved
app.get('/saved/:id', function(req, res) {
  db.Article.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { saved: true } },
    { new: true }
  )
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for removing saved articles
// app.get('/saved', function (req, res) {
//   db.Article.find({ saved: true })
//     .then(function (dbArticle) {
//       res.json(dbArticle);
//     })
//     .catch(function (err) {
//       res.json(err);
//     });
// });

// Route for grabbing a specific article by id, populate it with it's note
app.get('/articles/:id', function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate('note')
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updateing an article's associated note
app.post('/articles/:id', function(req, res) {
  db.Note.create(req.body).then(function(dbNote) {
    return db.Article.findOneAndUpdate(
      { _id: req.params.id },
      { note: dbNote._id },
      { new: true }
    );
  });
});

// Route for removing notes
app.get('/note/:id', function(req, res) {
  // Grab the article id from the params, find that in the db and remove the associated note
  db.Article.update({ _id: req.params.id }, { $unset: { note: '' } })
    .then(function(dbNote) {
      res.json(dbNote);
      console.log('Your note was deleted.');
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log('App running on port ' + PORT + '!');
});
