const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  // New watchlist with status categories
  watchlist: [{
    movieId: { type: Number, required: true },
    mediaType: { type: String, default: 'movie' },
    status: { type: String, enum: ['watch_later', 'watching', 'completed', 'dropped'], default: 'watch_later' },
    addedAt: { type: Date, default: Date.now }
  }],
  // Keep old savedList for backward compat
  savedList: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);