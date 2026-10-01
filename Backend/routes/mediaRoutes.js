// routes/mediaRoutes.js
// Inspect a media link, download it with progress, and keep a per-user receipt
// in history. Files live on disk only for as long as the browser takes to
// stream them; Mongo keeps the receipt, not the bytes.
import express from "express";
import mongoose from "mongoose";
import Download from "../models/Download.js";
import { identify } from "../middleware/identify.js";
import {
  deleteTask,
  getMediaInfo,
  getTaskFile,
  getTaskProgress,
  isYtDlpAvailable,
  sendTaskFile,
  startDownloadTask,
} from "../services/mediaService.js";

const router = express.Router();
router.use(identify);

const sendError = (res, status, message) => res.status(status).json({ message });

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Cap the URL so an absurd payload cannot bloat the history row. */
const MAX_URL_LENGTH = 2000;

// @route   GET /api/media/status
// @desc    Whether the yt-dlp backend is ready to accept links
// @access  Private
router.get("/status", (req, res) => {
  res.json({ ytdlp: isYtDlpAvailable() });
});

// @route   POST /api/media/info
// @desc    Resolve a URL into downloadable formats
// @access  Private
router.post("/info", async (req, res) => {
  const url = String(req.body?.url || "").trim();

  if (!url) return sendError(res, 400, "A URL is required.");
  if (url.length > MAX_URL_LENGTH) return sendError(res, 400, "That URL is too long.");

  try {
    res.json(await getMediaInfo(url));
  } catch (err) {
    // These are user-facing messages ("link unsupported", "install yt-dlp"),
    // not internal faults, so they are passed through rather than masked.
    sendError(res, 400, err.message);
  }
});

// @route   POST /api/media/download
// @desc    Begin a download and return its task id
// @access  Private
router.post("/download", (req, res) => {
  const url = String(req.body?.url || "").trim();
  const formatId = String(req.body?.formatId || "best").trim();
  const title = String(req.body?.title || "").trim().slice(0, 200);
  const source = String(req.body?.source || "unknown").trim().slice(0, 60);
  const thumbnail = typeof req.body?.thumbnail === "string" ? req.body.thumbnail : null;
  const size = parseInt(req.body?.size, 10) || null;

  if (!url) return sendError(res, 400, "A URL is required.");

  const owner = req.user._id;
  let recorded = false;

  const record = async (entry) => {
    if (recorded) return;
    recorded = true;
    await Download.create({ user: owner, ...entry }).catch((err) => {
      console.warn("Could not record download history:", err.message);
    });
  };

  let id;
  try {
    id = startDownloadTask({
      url,
      formatId,
      filename: title || "video",
      size,
      onFinish: (task) =>
        record({
          url,
          title: title || "Untitled",
          source: source || "unknown",
          thumbnail,
          formatId,
          sizeBytes: task.received || size || 0,
          status: "completed",
        }),
      onError: (reason) =>
        record({
          url,
          title: title || "Untitled",
          source: source || "unknown",
          thumbnail,
          formatId,
          sizeBytes: 0,
          status: "failed",
          failureReason: reason.slice(0, 500),
        }),
    });
  } catch (err) {
    // Capacity rejections and malformed URLs land here, before any worker ran.
    return sendError(res, 429, err.message);
  }

  res.status(202).json({ id });
});

// @route   GET /api/media/download/:id
// @desc    Poll progress for a running download
// @access  Private
router.get("/download/:id", (req, res) => {
  const progress = getTaskProgress(req.params.id);
  if (!progress) return sendError(res, 404, "That download is no longer on the server.");
  res.json(progress);
});

// @route   GET /api/media/file/:id
// @desc    Stream the finished file, then delete it from disk
// @access  Private
router.get("/file/:id", async (req, res) => {
  const entry = getTaskFile(req.params.id);
  if (!entry) return sendError(res, 404, "That download is not ready or has expired.");

  const { task, filePath } = entry;

  try {
    await sendTaskFile(res, filePath, task.filename);
  } catch (err) {
    console.error("GET /api/media/file/:id:", err.message);
    if (!res.headersSent) sendError(res, 500, "The file could not be sent.");
  } finally {
    deleteTask(req.params.id);
  }
});

// @route   POST /api/media/download/:id/cancel
// @desc    Stop a running download and clean up its files
// @access  Private
router.post("/download/:id/cancel", (req, res) => {
  res.json({ removed: deleteTask(req.params.id) });
});

// @route   GET /api/media/history
// @desc    List the user's download receipts, newest first
// @access  Private
router.get("/history", async (req, res) => {
  try {
    const downloads = await Download.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(
      downloads.map((item) => ({
        _id: item._id,
        url: item.url,
        title: item.title,
        source: item.source,
        thumbnail: item.thumbnail,
        size: item.sizeBytes,
        status: item.status,
        createdAt: item.createdAt,
      }))
    );
  } catch (err) {
    console.error("GET /api/media/history:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   DELETE /api/media/history/:id
// @desc    Forget one receipt
// @access  Private
router.delete("/history/:id", async (req, res) => {
  if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid history ID.");

  try {
    const deleted = await Download.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) return sendError(res, 404, "History entry not found.");
    res.json({ message: "History entry deleted", id: req.params.id });
  } catch (err) {
    console.error("DELETE /api/media/history/:id:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   DELETE /api/media/history
// @desc    Forget every receipt for the current user
// @access  Private
router.delete("/history", async (req, res) => {
  try {
    const result = await Download.deleteMany({ user: req.user._id });
    res.json({ message: "History cleared", removed: result.deletedCount });
  } catch (err) {
    console.error("DELETE /api/media/history:", err.message);
    sendError(res, 500, "Server error");
  }
});

export default router;