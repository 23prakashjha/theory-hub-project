// models/Language.js
import mongoose from "mongoose";

const languageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Language name is required"], // Add error message
      trim: true, // Remove extra spaces
    },
    description: {
      type: String,
      trim: true, // Optional, removes spaces
      default: "", // Default empty string
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Export the model
const Language = mongoose.model("Language", languageSchema);
export default Language;
