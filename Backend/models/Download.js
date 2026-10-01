// models/Download.js
import mongoose from "mongoose";

// One row per download the user completed (or failed to complete).
//
// The media file itself is transient: it lives under uploads/media-tmp/<taskId>
// and is deleted as soon as the browser has streamed it, or by the hourly
// sweeper after 24h. Mongo only remembers the receipt — what it was, where it
// came from and how big it was — which is what the History page renders.
//
// Scoped to a user exactly like Document, via the X-Device-Id header.
const downloadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },

    // The page the media came from.
    url: {
      type: String,
      required: [true, "Source URL is required"],
      trim: true,
    },

    title: {
      type: String,
      trim: true,
      default: "Untitled",
    },

    // Extractor key (youtube, vimeo, soundcloud) or "direct" for a raw file URL.
    source: {
      type: String,
      trim: true,
      default: "unknown",
    },

    thumbnail: {
      type: String,
      default: null,
    },

    sizeBytes: {
      type: Number,
      default: 0,
    },

    // Which quality tier was requested, so history can explain the size.
    formatId: {
      type: String,
      default: "best",
    },

    status: {
      type: String,
      enum: ["completed", "failed"],
      default: "completed",
    },

    failureReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// History list: newest first, per user.
downloadSchema.index({ user: 1, createdAt: -1 });

const Download = mongoose.model("Download", downloadSchema);
export default Download;