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

// GET route for scraping - pick a website ✅ 
axios.get('https://css-tricks.com/').then(function (response) {

  var $ = cheerio.load(response.data);

  var results = [];

  $('div.article-article h2').each(function (i, element) {

    var title = $(element).text();

    var summary = $('div.article-content p').text();

    var link = $(element)
      .children()
      .attr('href');

    results.push({
      title: title,
      link: link,
      summary: summary
    });
  });

  console.log(results);
});

// Route for getting all articles from the DB



// Route for grabbing a specific article by id, populate it with it's note

// Route for saving/updateing an article's associated note

// Start the server
app.listen(PORT, function() {
  console.log('App running on port ' + PORT + '!');
});
