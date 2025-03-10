const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentType: {
    type: String,
    enum: ['Question', 'Answer'],
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'parentType',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Comment', commentSchema);
