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

// Parse JSON body
app.use(express.json());

// ✅ FIXED CORS CONFIG (LOCAL + PRODUCTION)
const allowedOrigins = [
  "http://localhost:5173",
  "https://theory-hub-project.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

// ✅ VERY IMPORTANT FOR PREFLIGHT REQUESTS
app.options("*", cors());

// Serve static files
app.use("/uploads", express.static("uploads"));

// -------------------- Routes --------------------
app.use("/api/auth", authRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/theory", theoryRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("CodeTheory API Running...");
});

// -------------------- Error Handling --------------------

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Server error",
    error: err.message
  });
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
