const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");

const app = express();
const secret = "fhhfnkbdhbsjb687fnnfn5njkfth65";
const uploadMiddleware = multer({ dest: "uploads/" });

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

// MongoDB Connection
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
        { expiresIn: "1h" },
        (err, token) => {
          if (err) throw err;

          res
            .cookie("token", token, { httpOnly: true, maxAge: 3600000 })
            .status(200)
            .json({
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
  res
    .cookie("token", "", { httpOnly: true, maxAge: 0 })
    .json({ message: "Logged out successfully" });
});

// Create Post Route
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const ext = originalname.split(".").pop();
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });

    const { title, summary, content } = req.body;

    try {
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
      });

      res.json(postDoc);
    } catch (e) {
      console.error("Post creation error:", e);
      res.status(500).json({ message: "Error creating post" });
    }
  });
});

// Get All Posts
app.put("/post/:id", uploadMiddleware.single("file"), async (req, res) => {
  const { id } = req.params;

  try {
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Find the post to ensure it exists
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is authorized to update the post
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, userInfo) => {
      if (err) return res.status(401).json({ message: "Unauthorized" });

      if (post.author.toString() !== userInfo.id) {
        return res.status(403).json({ message: "Forbidden: Not the author" });
      }

      // Handle file upload if a new file is provided
      let newPath = post.cover; // Keep the existing cover by default
      if (req.file) {
        const { originalname, path } = req.file;
        const ext = originalname.split(".").pop();
        newPath = path + "." + ext;
        fs.renameSync(path, newPath);

        // Optionally, delete the old file if needed
        if (post.cover && fs.existsSync(post.cover)) {
          fs.unlinkSync(post.cover);
        }
      }

      // Update the post
      const { title, summary, content } = req.body;
      post.title = title || post.title;
      post.summary = summary || post.summary;
      post.content = content || post.content;
      post.cover = newPath;

      const updatedPost = await post.save();
      res.json(updatedPost);
    });
  } catch (e) {
    console.error("Post update error:", e);
    res.status(500).json({ message: "Error updating post" });
  }
});
app.get("/post", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (e) {
    console.error("Fetch posts error:", e);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Get Single Post by ID
app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findById(id).populate("author", ["username"]);
    res.json(postDoc);
  } catch (e) {
    console.error("Fetch post error:", e);
    res.status(500).json({ message: "Error fetching post" });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
