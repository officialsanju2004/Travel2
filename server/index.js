const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const leadRoutes = require("./routes/leads");
const activityRoutes = require("./routes/activities");
const dashboardRoutes = require("./routes/dashboard");
const paymentRoutes = require("./routes/payments");

const app = express();

/* =========================
   🔥 MongoDB Connection
========================= */

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// ✅ Connect once at startup
connectDB();

/* =========================
   🔥 Middlewares
========================= */

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

/* =========================
   🔥 Routes
========================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TravelCRM Backend Running Successfully 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API is healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentRoutes);

/* =========================
   🔥 Error Handler
========================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
