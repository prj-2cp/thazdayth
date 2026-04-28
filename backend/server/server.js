require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const mongoSanitize = require('express-mongo-sanitize');//This package strips out keys that begin with $ or contain a . from user inputs (like forms or URLs).

//here i created the server 
const app = express();

app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
// server.js — add this near the top
const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:8080', 
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

//to make our server able to read json data
app.use(express.json());

//security middeleware every request that comes to our  server will be automatically sanitized (install the pacage here before you run )
app.use(mongoSanitize());

// Database connection management for Serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  console.log("=> Connecting to MongoDB...");
  cachedDb = await mongoose.connect(process.env.MONGO_URL);
  console.log("=> MongoDB Connected");
  return cachedDb;
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ message: "Erreur de connexion à la base de données." });
  }
});

// Register your routes here 
const authRoutes = require("./routes/auth").default;
const users = require("./routes/users").default;
const comments = require("./routes/comments").default;
const notifications = require("./routes/notifications").default
const products = require("./routes/products").default
const orders = require("./routes/orders").default;
const availability = require("./routes/availability").default;
const shippingRates = require("./routes/shippingRates").default;
const prices = require("./routes/prices").default;
const pressing = require("./routes/pressing").default;
const settings = require("./routes/settings").default;

//use routes

app.use("/api/users", users);
app.use("/api/auth", authRoutes);
app.use("/api/comments", comments);
app.use("/api/notifications", notifications);
app.use("/api/products", products);
app.use("/api/orders", orders);
app.use("/api/availability", availability);
app.use("/api/shipping-rates", shippingRates);
app.use("/api/prices", prices);
app.use("/api/pressing", pressing);
app.use("/api/settings", settings);

// Sent the server to the port to listen to requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`THE SERVER IS RUNNIG ON PORT ${PORT}`);
});