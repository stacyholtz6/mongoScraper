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


// go to saved articles button



// when p tag is clicked
$(document).on('click', 'p', function() {
  $('#notes').empty();
  // Save the id from the p tag
  var thisId = $(this).attr('data-id');

  //  Ajax call for the articles
  $.ajax({
    method: 'GET',
    url: '/articles/' + thisId
  })
  .then(function(data) {
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

    // If there's a note in the article
    if (data.note) {
      // Place the title of the note in the title input
      $('#titleinput').val(data.note.title);
      // Place the body of the note in the body textarea
      $('#bodyinput').val(data.note.body);
    }
  });
});

// When you click the savenote button
$(document).on('click', '#savenote', function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr('data-id');

  // Post request to change the note
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
  .then(function(data) {
    console.log(data);

    $('#notes').empty();
  });

  // Also, remove the values entered in the input and textarea for note entry
  $('#titleinput').val('');
  $('#bodyinput').val('');
});

// delete note button click

