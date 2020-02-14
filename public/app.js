// Grab the articles as a json
$.getJSON('/articles', function(data) {
  for (var i = 0; i < data.length; i++) {
    // Display the information on the page
    $('#articles').append(
      "<p data-id='" +
        data[i]._id +
        "'>" +
        data[i].title +
        '<br />' +
        data[i].link +
        '<br />' +
        data[i].summary +
        '</p>'
    );
    // add button to save articles
    $('#articles').append(
      "<button data-id='" +
        data[i]._id +
        "' id='save-article'>Save Article</button>"
    );
  }
});

// when the scrape button is clicked
$('#scrape').on('click', function() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/scrape',
    success: function(response) {
      $('#articles').empty();
    }
  });
});

// when save article button is clicked
$(document).on('click', '#save-article', function() {
  // get the id of article associated with the button
  var thisId = $(this).attr('data-id');
  console.log('thisId-save-article', thisId);

  // make a post request to get that saved id

  $.ajax({
    method: 'POST',
    url: '/saved/' + thisId
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
    });
});

// go to saved articles button
$('#saved').on('click', function(event) {
  window.location.href = '/saved.html';
});

// Get the saved articles as json
$.getJSON('/saved', function(data) {
  for (var i = 0; i < data.length; i++) {
    // show article details on the page
    $('#saved-articles').append(
      "<p data-id='" +
        data[i]._id +
        "'>" +
        data[i].title +
        '<br />' +
        data[i].link +
        '<br />' +
        data[i].summary +
        '</p>'
    );
    $('#saved-articles').append(
      "<button data-id='" +
        data[i]._id +
        "' id='delete-article'>Delete Article</button>"
    );
  }
});
// notes section - p tag clicked - not shows
$(document).on('click', 'p', function() {
  $('#notes').empty();
  // Save the id from the p tag
  var thisId = $(this).attr('data-id');
  console.log('notes id', thisId);
  //  Ajax call for the articles
  $.ajax({
    method: 'GET',
    url: '/articles/' + thisId
  }).then(function(data) {
    console.log(data);
    // The title of the article
    $('#notes').append('<h2>' + data.title + '</h2>');
    // An input to enter a new title
    $('#notes').append("<input id='titleinput' name='title' >");
    // A textarea to add a new note body
    $('#notes').append("<textarea id='bodyinput' name='body'></textarea>");
    // A button to submit a new note, with the id of the article saved to it
    $('#notes').append(
      "<button data-id='" + data._id + "' id='savenote'>Save Note</button>"
    );
    // Delete note
    $('#notes').append(
      "<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>"
    );
    // If there's a note in the article
    if (data.note) {
      // Place the title of the note in the title input
      $('#titleinput').val(data.note.title);
      // Place the body of the note in the body textarea
      $('#bodyinput').val(data.note.body);
    }
  });
});

$(document).on('click', '#savenote', function() {
  // Grab the id associated with the article from the submit button - Get the ID currently no error
  var thisId = $(this).attr('data-id');
  console.log('save-note-id', thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: 'POST',
    url: '/articles/' + thisId,
    data: {
      // Value taken from title input
      title: $('#titleinput').val(),
      // Value taken from note textarea
      body: $('#bodyinput').val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $('#notes').empty();
    });
  // Also, remove the values entered in the input and textarea for note entry
  $('#titleinput').val('');
  $('#bodyinput').val('');
});

// go back to home button
$('#home').on('click', function(event) {
  window.location.href = '/';
});
