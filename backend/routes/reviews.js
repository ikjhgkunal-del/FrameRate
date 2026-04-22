const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const verifyToken = require('../middleware/verifyToken');

// ─── CREATE REVIEW ───
router.post('/', verifyToken, async (req, res) => {
  try {
    const { movieId, mediaType, rating, content, isSpoiler } = req.body;
    if (!movieId || !rating || !content) {
      return res.status(400).json({ message: "movieId, rating, and content are required" });
    }
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ message: "Rating must be between 1 and 10" });
    }
    if (content.length > 5000) {
      return res.status(400).json({ message: "Review too long (max 5000 chars)" });
    }

    // Upsert: update if exists, create if not
    const review = await Review.findOneAndUpdate(
      { userId: req.user.id, movieId, mediaType: mediaType || 'movie' },
      {
        userId: req.user.id,
        username: req.user.username || 'Anonymous',
        movieId,
        mediaType: mediaType || 'movie',
        rating,
        content,
        isSpoiler: isSpoiler || false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "You already reviewed this title" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// ─── GET REVIEWS FOR A MOVIE ───
router.get('/:mediaType/:movieId', async (req, res) => {
  try {
    const { mediaType, movieId } = req.params;
    const { sort } = req.query; // newest, highest, lowest, helpful

    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'highest') sortOption = { rating: -1 };
    else if (sort === 'lowest') sortOption = { rating: 1 };
    else if (sort === 'helpful') sortOption = { upvotes: -1 };

    const reviews = await Review.find({ movieId: parseInt(movieId), mediaType })
      .sort(sortOption)
      .limit(50);

    // Aggregate stats
    const stats = await Review.aggregate([
      { $match: { movieId: parseInt(movieId), mediaType } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          distribution: { $push: '$rating' },
        },
      },
    ]);

    // Build distribution (1-10)
    const distribution = Array(10).fill(0);
    if (stats.length > 0 && stats[0].distribution) {
      stats[0].distribution.forEach(r => { distribution[r - 1]++; });
    }

    res.json({
      reviews,
      stats: stats.length > 0
        ? { avgRating: stats[0].avgRating, totalReviews: stats[0].totalReviews, distribution }
        : { avgRating: 0, totalReviews: 0, distribution },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── UPVOTE / DOWNVOTE ───
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const userId = req.user.id;

    if (voteType === 'up') {
      // Remove from downvotes if present, toggle upvote
      review.downvotes = review.downvotes.filter(id => id.toString() !== userId);
      const idx = review.upvotes.findIndex(id => id.toString() === userId);
      if (idx > -1) review.upvotes.splice(idx, 1); // un-upvote
      else review.upvotes.push(userId);
    } else if (voteType === 'down') {
      review.upvotes = review.upvotes.filter(id => id.toString() !== userId);
      const idx = review.downvotes.findIndex(id => id.toString() === userId);
      if (idx > -1) review.downvotes.splice(idx, 1);
      else review.downvotes.push(userId);
    }

    await review.save();
    res.json({ upvotes: review.upvotes.length, downvotes: review.downvotes.length });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── DELETE OWN REVIEW ───
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
