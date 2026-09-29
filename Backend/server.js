import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { initStorage } from "./services/storageService.js";
import { uploadsConfig } from "./config/env.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

dotenv.config();

// Connect to MongoDB
connectDB();

// Create the uploads directory tree so PDF storage works on a cold start
initStorage()
  .then(() => console.log("📁 Upload storage ready"))
  .catch((err) => console.error("⚠️  Upload storage unavailable:", err.message));

const app = express();

// -------------------- Middleware --------------------

// Parse JSON body
app.use(express.json());

// ✅ FIXED CORS CONFIG (LOCAL + PRODUCTION)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "https://theory-hub-project.vercel.app",
  "https://theory-hub-project.onrender.com"
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
    allowedHeaders: ["Content-Type", "Authorization", "X-Device-Id"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);

// ✅ VERY IMPORTANT FOR PREFLIGHT REQUESTS
app.options("*", cors());

// Serve static files
// Absolute path so uploaded PDFs resolve regardless of the shell's cwd.
app.use("/uploads", express.static(uploadsConfig.dir));

// -------------------- Routes --------------------
app.use("/api/users", userRoutes);

// -------------------- PDF documents --------------------
app.use("/api/documents", documentRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("CodeTheory API Running...");
});

// Feature status: is the upload dir writable?
app.get("/api/health", async (req, res) => {
  const storageReady = await initStorage()
    .then(() => true)
    .catch(() => false);

  res.json({
    status: "ok",
    storage: storageReady ? "ready" : "unavailable",
    uptimeSeconds: Math.round(process.uptime()),
  });
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
