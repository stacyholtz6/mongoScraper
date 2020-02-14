// Dependencies
var express = require('express');

var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');

var db = require('./models');

var PORT = process.env.PORT || 8080;

var app = express();

// static folder
app.use(express.static('public'));
// Use morgan logger for logging requests
app.use(logger('dev'));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost/articleScraper';

mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

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

// Route for getting all Articles marked as saved
app.get('/saved', function(req, res) {
  // Grab every document in the Articles collection with saved equal to true
  db.Article.find({ saved: true })
    .then(function(dbArticle) {
      // If we were able to successfully find saved Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for updating an article marked as saved
app.post('/saved/:id', function(req, res) {
  // Grab the article id from the params, find that in the db and changed saved to true
  db.Article.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { saved: true } },
    { new: true }
  )
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

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
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for removing notes
app.get('/note/:id', function(req, res) {
  // Grab the article id from the params, find that in the db and remove the associated note
  db.Article.updateOne({ _id: req.params.id }, { $unset: { note: '' } })
    .then(function(dbNote) {
      res.json(dbNote);
      console.log('Your note was deleted.');
    })
    .catch(function(err) {
      res.json(err);
    });
});

// remove from saved
app.get('/remove/:id', function(req, res) {
  // Grab the article id from the params, find that in the db and changed saved to true
  db.Article.remove({ _id: req.params.id }, { $set: { saved: false } })
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log('App running on port ' + PORT + '!');
});
