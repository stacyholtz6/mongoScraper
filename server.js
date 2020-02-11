var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');

var db = require('./models');

var PORT = 3000;

var app = express();

// Use morgan logger for logging requests
app.use(logger('dev'));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static('public'));

// Connect to the Mongo DB
mongoose.connect('mongodb://localhost/articleScraper', {
  useNewUrlParser: true
});

// Routes

// GET route for scraping - scrape works - need summary
app.get('/scrape', function(req, res) {
  axios.get('https://css-tricks.com/').then(function(response) {
    var $ = cheerio.load(response.data);

    $('div.article-article h2').each(function(i, element) {
      var result = {};

      result.title = $(this).text();
      // come back to the summary later
      // var summary = $('div.article-content p').text();

      result.link = $(this)
        .children()
        .attr('href');

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    // console.log(results);
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





// Route for saving/updateing an article's associated note





// Start the server
app.listen(PORT, function() {
  console.log('App running on port ' + PORT + '!');
});
