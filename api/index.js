const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
var bcryptjs = require("bcryptjs");
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/bloggingWebsite")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const userDoc = await User.create({ username, password, email });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
