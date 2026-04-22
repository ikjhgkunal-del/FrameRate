const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// ─── ADD TO WATCHLIST WITH STATUS ───
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { movieId, mediaType, status } = req.body;
    const numericId = Number(movieId);
    const validStatuses = ['watch_later', 'watching', 'completed', 'dropped'];
    const listStatus = validStatuses.includes(status) ? status : 'watch_later';
    const mType = mediaType || 'movie';

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Check if already in watchlist (coerce both sides to Number)
    const existingIdx = user.watchlist.findIndex(w => Number(w.movieId) === numericId && w.mediaType === mType);
    if (existingIdx !== -1) {
      user.watchlist[existingIdx].status = listStatus;
    } else {
      user.watchlist.push({ movieId: numericId, mediaType: mType, status: listStatus });
    }
    await user.save();
    res.status(200).json(user.watchlist);
  } catch (error) {
    console.error("Add to watchlist error:", error);
    res.status(500).json({ message: "Error adding to watchlist" });
  }
});

// ─── REMOVE FROM WATCHLIST ───
router.post('/remove', verifyToken, async (req, res) => {
  try {
    const { movieId, mediaType } = req.body;
    const numericId = Number(movieId);
    const user = await User.findById(req.user.id);
    user.watchlist = user.watchlist.filter(w => !(Number(w.movieId) === numericId && w.mediaType === (mediaType || 'movie')));
    await user.save();
    res.status(200).json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: "Error removing from watchlist" });
  }
});

// ─── GET FULL WATCHLIST ───
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user.watchlist || []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching watchlist" });
  }
});

// ─── GET WATCHLIST BY STATUS ───
router.get('/status/:status', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const filtered = (user.watchlist || []).filter(w => w.status === req.params.status);
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Error fetching watchlist" });
  }
});

module.exports = router;