const mongoose = require('mongoose');
const answerSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
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
  
  module.exports = mongoose.model('Answer', answerSchema);