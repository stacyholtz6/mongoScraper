var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    require: true
  },
  link: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: 'No Summary Available'
    // required: true
  },
  saved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'Save Article'
  },
  created: {
    type: Date,
    default: Date.now
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: 'Note'
  }
});

// ArticleSchema.index({ title: 'text' });

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
