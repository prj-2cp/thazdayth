require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const mongoSanitize = require('express-mongo-sanitize');//This package strips out keys that begin with $ or contain a . from user inputs (like forms or URLs).

//here i created the server 
const app = express();

// server.js — add this near the top
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'], // support both common Vite ports
  credentials: true,
}));

//to make our server able to read json data
app.use(express.json());

//security middeleware every request that comes to our  server will be automatically sanitized (install the pacage here before you run )
app.use(mongoSanitize());

//register your routes here 
const authRoutes = require("./routes/auth").default;
const users = require("./routes/users").default;
const comments = require("./routes/comments").default;
const notifications = require("./routes/notifications").default
const products = require("./routes/products").default
const orders = require("./routes/orders").default;

//use routes

app.use("/api/users", users);
app.use("/api/auth", authRoutes);
app.use("/api/comments", comments);
app.use("/api/notifications", notifications);
app.use("/api/products", products);
app.use("/api/orders", orders);

//connection to mongo atlas 
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MONGO DB IS CONNECTED"))
  .catch(error => console.log(`MONGO DB CONNECTION FAILURE ${error}`));



//sent the server to the port to listen to requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`THE SERVER IS RUNNIG ON PORT ${PORT}`);
});