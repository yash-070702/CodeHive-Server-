const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
  }],
  
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],

  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Store users who upvoted
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Store users who downvoted
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Question', questionSchema);