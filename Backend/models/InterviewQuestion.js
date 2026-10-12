// models/InterviewQuestion.js
import mongoose from "mongoose";

// One interview question the user was actually asked — captured while it is
// still fresh so it can be revised before the next interview instead of being
// forgotten. Scoped to a user exactly like Document, via the X-Device-Id
// header, because a person's interview history is personal.
const interviewQuestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },

    // -------------------- The question --------------------
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: 2000,
    },

    // The model answer, or the user's own notes on how to approach it.
    answer: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20000,
    },

    // -------------------- Context --------------------
    company: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },

    role: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },

    // Broad topic: DSA, JavaScript, React, System Design, HR, ...
    category: {
      type: String,
      trim: true,
      default: "General",
      maxlength: 60,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // How far along the user is with it.
    status: {
      type: String,
      enum: ["saved", "practicing", "mastered"],
      default: "saved",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    starred: {
      type: Boolean,
      default: false,
    },

    // How many times this has come up across interviews.
    timesAsked: {
      type: Number,
      default: 1,
      min: 1,
    },

    lastAskedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Listing: newest first, per user.
interviewQuestionSchema.index({ user: 1, createdAt: -1 });
interviewQuestionSchema.index({ user: 1, category: 1 });

const InterviewQuestion = mongoose.model("InterviewQuestion", interviewQuestionSchema);
export default InterviewQuestion;
