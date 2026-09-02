const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Design', 'Business', 'Lifestyle', 'Tutorial', 'News']
  },
  readTime: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: 'Admin'
  },
  imageUrl: {
    type: String,
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
blogSchema.index({ category: 1, createdAt: -1 });
blogSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
