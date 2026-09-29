// models/Document.js
import mongoose from "mongoose";

// A PDF the user uploaded. The file itself lives on local disk under
// uploads/documents/<userId>/; only its metadata is stored in Mongo.
// "Permanent" here means: it survives page refreshes, restarts and
// redeploys of the frontend, and can be reopened and viewed at any time.
const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },

    // -------------------- File --------------------
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      default: "Untitled document",
    },

    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },

    storedName: {
      type: String,
      required: [true, "Stored file name is required"],
    },

    publicUrl: {
      type: String,
      default: "",
    },

    mimeType: {
      type: String,
      default: "application/pdf",
    },

    sizeBytes: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "ready",
    },

    failureReason: {
      type: String,
      default: "",
    },

    // -------------------- Library state --------------------
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Library listing: newest first, per user.
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ title: "text", fileName: "text" });

const Document = mongoose.model("Document", documentSchema);
export default Document;
