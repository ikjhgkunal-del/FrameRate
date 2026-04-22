const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Number, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
  rating: { type: Number, min: 1, max: 10, required: true },
}, { timestamps: true });

// One rating per user per movie
ratingSchema.index({ userId: 1, movieId: 1, mediaType: 1 }, { unique: true });
ratingSchema.index({ movieId: 1, mediaType: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
