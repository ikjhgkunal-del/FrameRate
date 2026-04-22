const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const verifyToken = require('../middleware/verifyToken');

// ─── RATE A MOVIE (1-10) ───
router.post('/', verifyToken, async (req, res) => {
  try {
    const { movieId, mediaType, rating } = req.body;
    if (!movieId || !rating) {
      return res.status(400).json({ message: "movieId and rating are required" });
    }
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ message: "Rating must be between 1 and 10" });
    }

    const result = await Rating.findOneAndUpdate(
      { userId: req.user.id, movieId, mediaType: mediaType || 'movie' },
      { userId: req.user.id, movieId, mediaType: mediaType || 'movie', rating },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(result);
  } catch (error) {
    console.error("Rate error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET AGGREGATE RATINGS FOR A MOVIE ───
router.get('/:mediaType/:movieId', async (req, res) => {
  try {
    const { mediaType, movieId } = req.params;
    const stats = await Rating.aggregate([
      { $match: { movieId: parseInt(movieId), mediaType } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratings: { $push: '$rating' },
        },
      },
    ]);

    const distribution = Array(10).fill(0);
    if (stats.length > 0) {
      stats[0].ratings.forEach(r => { distribution[r - 1]++; });
    }

    res.json({
      avgRating: stats.length > 0 ? stats[0].avgRating : 0,
      totalRatings: stats.length > 0 ? stats[0].totalRatings : 0,
      distribution,
    });
  } catch (error) {
    console.error("Get ratings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET CURRENT USER'S RATING FOR A MOVIE ───
router.get('/user/:mediaType/:movieId', verifyToken, async (req, res) => {
  try {
    const { mediaType, movieId } = req.params;
    const rating = await Rating.findOne({
      userId: req.user.id,
      movieId: parseInt(movieId),
      mediaType,
    });
    res.json({ rating: rating ? rating.rating : null });
  } catch (error) {
    console.error("Get user rating error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
