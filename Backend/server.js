import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import languageRoutes from "./routes/languageRoutes.js";
import theoryRoutes from "./routes/theoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// -------------------- Middleware --------------------

// Parse JSON requests
app.use(express.json());

// Enable CORS for frontend (React)
app.use(
  cors({
    origin: "http://localhost:5173", // Your React app URL
    credentials: true,              // Allow cookies
  })
);

// Serve static files (like uploaded avatars)
app.use("/uploads", express.static("uploads"));

// -------------------- Routes --------------------
app.use("/api/auth", authRoutes);       // Auth routes: login/signup
app.use("/api/languages", languageRoutes); // Language routes
app.use("/api/theory", theoryRoutes);  
app.use("/api/users", userRoutes);  // Theory routes

// Health check route
app.get("/", (req, res) => {
  res.send("CodeTheory API Running...");
});

// -------------------- Error Handling --------------------
// Handle unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
