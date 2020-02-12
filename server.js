var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');

var db = require('./models');

var PORT = process.env.PORT || 8080;

var app = express();

// Use morgan logger for logging requests
app.use(logger('dev'));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static('public'));

// Connect to the Mongo DB
// mongoose.connect('mongodb://localhost/articleScraper', {
//   useNewUrlParser: true
// });

var MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost/articleScraper';

mongoose.connect(MONGODB_URI);

// Routes

// GET route for scraping - scrape works - need summary
app.get('/scrape', function(req, res) {
  axios.get('https://www.reviewjournal.com/').then(function(response) {
    var $ = cheerio.load(response.data);

    $('div.entry-title').each(function(i, element) {
      var result = {};

      result.title = $(this).text();

      result.link = $(this)
        .children()
        .attr('href');

      // var summary = $('div.article-content p').text();
      result.summary = $(this).parent();
      // .next()
      // .hasClass('field-excerpt')
      // .closest('p')
      // .children()
      // .attr('div')
      // .parent()
      // .attr('p')
      // .find('p')
      // .parent()
      // .children()
      // .text();

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(result);
        })
        .catch(function(err) {
          //console.log(err);
        });
    });
    // console.log($.html());
    // console.log(result);
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

// Start the server
app.listen(PORT, function() {
  console.log('App running on port ' + PORT + '!');
});
