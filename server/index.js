const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leadRoutes = require('./routes/leads');
const activityRoutes = require('./routes/activities');
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payments');

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TravelCRM Backend Running Successfully 🚀"
  });
});

// ✅ Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', version: '2.0', message: 'TravelCRM Enterprise API' })
);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});


// 🔥 MongoDB Connection (IMPORTANT for Vercel)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err);
    throw err;
  }
};

// Every request pe DB connect ensure karo
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

module.exports = app;
