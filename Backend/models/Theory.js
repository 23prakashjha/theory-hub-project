// models/Theory.js
import mongoose from "mongoose";

const theorySchema = new mongoose.Schema(
  {
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: [true, "Language is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    codeExample: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Theory = mongoose.model("Theory", theorySchema);
export default Theory;



