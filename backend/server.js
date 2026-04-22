const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// CORS — allow frontend origin in production, permissive in dev
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Health check endpoint (useful for EC2 load balancers)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log("MongoDB Connection Error: ", err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/list', require('./routes/list'));
app.use('/api/reels', require('./routes/reels'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/ratings', require('./routes/ratings'));

// Server — bind to 0.0.0.0 so EC2 can accept external connections
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});