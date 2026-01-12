// routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Helper to send consistent error responses
const sendError = (res, status, message) => res.status(status).json({ message });

// ======================
// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
// ======================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 400, "User already exists");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (default role "user")
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");
      return sendError(res, 500, "Server configuration error");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userData } = user._doc;

    res.status(201).json({ user: userData, token });
  } catch (err) {
    console.error("Signup Error:", err);
    sendError(res, 500, "Server error");
  }
});

// ======================
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    // Select password explicitly because schema has select: false
    const user = await User.findOne({ email }).select("+password");
    if (!user) return sendError(res, 400, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 400, "Invalid credentials");

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");
      return sendError(res, 500, "Server configuration error");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user._doc;

    res.json({ user: userData, token });
  } catch (err) {
    console.error("Login Error:", err);
    sendError(res, 500, "Server error");
  }
});

export default router;
