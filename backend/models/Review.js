const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  movieId: { type: Number, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
  rating: { type: Number, min: 1, max: 10, required: true },
  content: { type: String, required: true, maxlength: 5000 },
  isSpoiler: { type: Boolean, default: false },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// One review per user per movie
reviewSchema.index({ userId: 1, movieId: 1, mediaType: 1 }, { unique: true });
reviewSchema.index({ movieId: 1, mediaType: 1 });

module.exports = mongoose.model('Review', reviewSchema);
