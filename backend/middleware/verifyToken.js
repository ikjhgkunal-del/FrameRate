const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "You are not authenticated! Please log in." });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, "mySuperSecretMovieAppKey123!");
    // Attach full user info (id + username) for review creation
    const user = await User.findById(decoded.id).select('username email');
    if (!user) return res.status(404).json({ message: "User not found" });
    req.user = { id: decoded.id, username: user.username, email: user.email };
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(403).json({ message: "Token is not valid or expired!" });
  }
}

module.exports = verifyToken;