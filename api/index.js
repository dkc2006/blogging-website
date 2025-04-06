const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const secret = "fhhfnkbdhbsjb687fnnfn5njkfth65";

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect("mongodb://localhost:27017/bloggingWebsite")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Register Route
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });
    }

    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = bcryptjs.hashSync(password, salt);

    const userDoc = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(200).json(userDoc);
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  try {
    const userDoc = await User.findOne({ username: userName });

    if (!userDoc) {
      return res.status(400).json({ message: "User not found" });
    }

    const passOk = bcryptjs.compareSync(password, userDoc.password);

    if (passOk) {
      jwt.sign(
        { username: userDoc.username, id: userDoc._id },
        secret,
        {},
        (err, token) => {
          if (err) throw err;

          res.cookie("token", token, { httpOnly: true }).status(200).json({
            id: userDoc._id,
            username: userDoc.username,
            message: "Login successful",
          });
        }
      );
    } else {
      res.status(400).json({ message: "Wrong credentials" });
    }
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Profile Route
app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    res.json(info);
  });
});

// Logout Route
app.post("/logout", (req, res) => {
  res.cookie("token", "").json({ message: "Logged out successfully" });
});

// Start server
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
