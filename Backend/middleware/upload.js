// middleware/upload.js
// Multer config for PDF uploads. Files are buffered in memory rather than
// written straight to disk because we need to read them for text extraction
// before we know the final stored name, and the 15MB cap keeps that safe.

import multer from "multer";
import { uploadsConfig } from "../config/env.js";

export const MAX_UPLOAD_BYTES = uploadsConfig.maxFileBytes;
export const ACCEPTED_MIME = "application/pdf";

export const ACCEPTED_EXTENSIONS = [".pdf"];

const hasPdfExtension = (originalName = "") =>
  ACCEPTED_EXTENSIONS.some((ext) => originalName.toLowerCase().endsWith(ext));

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const looksPdf =
    ACCEPTED_MIME.includes(file.mimetype) || hasPdfExtension(file.originalname);

  if (!looksPdf) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only PDF files can be uploaded."));
  }
  return cb(null, true);
};

export const uploadSinglePdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
}).single("file");

/** Wrap the multer middleware so its errors come back as clean JSON. */
export const handlePdfUpload = (req, res, next) => {
  uploadSinglePdf(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        const mb = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
        return res.status(413).json({ message: `That file is too large. The limit is ${mb}MB.` });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "Upload exactly one PDF file." });
      }
      return res.status(400).json({ message: "That file could not be uploaded." });
    }

    console.error("upload middleware:", err.message);
    return res.status(400).json({ message: "That file could not be uploaded." });
  });
};

export default handlePdfUpload;
