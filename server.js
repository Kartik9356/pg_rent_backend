const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

// Connect to MongoDB
connectDB();

const app = express();

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // Your React app's URL
    credentials: true, // Crucial: Allows cookies to be sent
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- API ROUTES ---
app.use("/api/users", require("./routes/userRoutes"));

app.get("/", (req, res) => {
  res.send("RentMate API is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
