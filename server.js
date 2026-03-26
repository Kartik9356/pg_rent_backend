const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Allows Express to parse form data

// Make the 'uploads' folder publicly accessible for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic test route
app.get("/", (req, res) => {
  res.send("RentMate API is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
