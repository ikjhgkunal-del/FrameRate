const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//sign wala part
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration Error: ", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

//login wala part
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    //secret key
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5d' });

    res.status(200).json({ 
      token: token, 
      user: { id: user._id, username: user.username, email: user.email } 
    });
    
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;