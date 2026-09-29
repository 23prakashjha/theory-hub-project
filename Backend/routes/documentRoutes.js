// routes/documentRoutes.js
// Upload PDFs, keep them permanently, and hand them back for viewing.
import express from "express";
import mongoose from "mongoose";
import Document from "../models/Document.js";
import { identify } from "../middleware/identify.js";
import { handlePdfUpload } from "../middleware/upload.js";
import {
  saveDocument,
  deleteDocument,
  readDocument,
  publicUrlFor,
  newId,
} from "../services/storageService.js";

const router = express.Router();
router.use(identify);

const sendError = (res, status, message) => res.status(status).json({ message });

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Shape a document for the client. */
const present = (doc) => ({
  _id: doc._id,
  title: doc.title,
  fileName: doc.fileName,
  publicUrl: doc.publicUrl,
  mimeType: doc.mimeType,
  sizeBytes: doc.sizeBytes,
  status: doc.status,
  failureReason: doc.failureReason,
  tags: doc.tags,
  pinned: doc.pinned,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

// @route   GET /api/documents
// @desc    List the signed-in user's saved documents
// @access  Private
router.get("/", async (req, res) => {
  try {
    const { search, tag, pinned, sort } = req.query;
    const query = { user: req.user._id };

    if (pinned === "true") query.pinned = true;
    if (tag) query.tags = { $in: [String(tag).trim()] };
    if (search) {
      const safe = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (safe) {
        query.$or = [
          { title: new RegExp(safe, "i") },
          { fileName: new RegExp(safe, "i") },
        ];
      }
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      title: { title: 1 },
      largest: { sizeBytes: -1 },
    };

    const docs = await Document.find(query).sort(sortMap[sort] || sortMap.newest);

    res.json(docs.map(present));
  } catch (err) {
    console.error("GET /api/documents:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   GET /api/documents/library/stats
// @desc    Aggregate counts for the dashboard strip
// @access  Private
router.get("/library/stats", async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id })
      .select("sizeBytes status pinned createdAt")
      .lean();

    const ready = docs.filter((d) => d.status === "ready");

    res.json({
      documents: docs.length,
      ready: ready.length,
      failed: docs.length - ready.length,
      sizeBytes: docs.reduce((sum, d) => sum + (d.sizeBytes || 0), 0),
      pinned: docs.filter((d) => d.pinned).length,
      lastUpload: docs.length
        ? docs.reduce((max, d) => (d.createdAt > max ? d.createdAt : max), docs[0].createdAt)
        : null,
    });
  } catch (err) {
    console.error("GET /api/documents/library/stats:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   GET /api/documents/:id
// @desc    Fetch one document
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid document ID");

    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return sendError(res, 404, "Document not found");

    res.json(present(doc));
  } catch (err) {
    console.error("GET /api/documents/:id:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   GET /api/documents/:id/file
// @desc    Stream the original PDF back
// @access  Private
router.get("/:id/file", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid document ID");

    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return sendError(res, 404, "Document not found");

    const buffer = await readDocument(doc.storedName);
    if (!buffer) return sendError(res, 404, "The stored file could not be found.");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${doc.fileName}"`);
    res.send(buffer);
  } catch (err) {
    console.error("GET /api/documents/:id/file:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   POST /api/documents
// @desc    Upload a PDF and save it permanently
// @access  Private
router.post("/", handlePdfUpload, async (req, res) => {
  let created = null;

  try {
    if (!req.file) return sendError(res, 400, "Please choose a PDF file to upload.");

    const docId = newId();
    const userId = req.user._id;

    const saved = await saveDocument({
      userId,
      docId,
      originalName: req.file.originalname,
      buffer: req.file.buffer,
    });

    const titleFromName = req.body?.title?.trim()
      || req.file.originalname
          .replace(/\.pdf$/i, "")
          .replace(/[-_]+/g, " ")
          .trim();

    created = await Document.create({
      _id: docId,
      user: userId,
      title: titleFromName || "Untitled document",
      fileName: req.file.originalname,
      storedName: saved.storedName,
      publicUrl: publicUrlFor(saved.storedName),
      mimeType: req.file.mimetype || "application/pdf",
      sizeBytes: saved.size,
      status: "ready",
      tags: (() => {
        const raw = String(req.body?.tags || "")
          .split(",")
          .map((t) => t.trim().replace(/^#/, ""))
          .filter(Boolean);
        return raw.length ? raw.slice(0, 8) : [];
      })(),
    });

    res.status(201).json(present(created));
  } catch (err) {
    console.error("POST /api/documents:", err.message);

    // Never leave an orphan file on disk if the request failed overall.
    if (created?.storedName) {
      await deleteDocument(created.storedName);
      await Document.deleteOne({ _id: created._id }).catch(() => {});
    }

    sendError(res, 500, "Server error");
  }
});

// @route   PATCH /api/documents/:id
// @desc    Rename, tag, pin/unpin a saved document
// @access  Private
router.patch("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid document ID");

    const updates = {};
    if (typeof req.body?.title === "string" && req.body.title.trim()) {
      updates.title = req.body.title.trim().slice(0, 200);
    }
    if (Array.isArray(req.body?.tags)) {
      updates.tags = req.body.tags
        .map((t) => String(t).trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 8);
    }
    if (typeof req.body?.pinned === "boolean") updates.pinned = req.body.pinned;

    if (!Object.keys(updates).length) return sendError(res, 400, "Nothing to update.");

    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updates },
      { new: true }
    );

    if (!doc) return sendError(res, 404, "Document not found");

    res.json(present(doc));
  } catch (err) {
    console.error("PATCH /api/documents/:id:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   DELETE /api/documents/:id
// @desc    Remove a document and its file from disk
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid document ID");

    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return sendError(res, 404, "Document not found");

    await deleteDocument(doc.storedName);
    await doc.deleteOne();

    res.json({ message: "Document deleted", id: req.params.id });
  } catch (err) {
    console.error("DELETE /api/documents/:id:", err.message);
    sendError(res, 500, "Server error");
  }
});

export default router;
