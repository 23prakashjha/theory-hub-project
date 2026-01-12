import express from "express";
import mongoose from "mongoose";
import Theory from "../models/Theory.js";
import Language from "../models/Language.js";

const router = express.Router();

/**
 * @route   GET /api/theory
 * @desc    Get all theory OR theory by language
 * @query   languageId (optional)
 */
router.get("/", async (req, res) => {
  try {
    const { languageId } = req.query;

    let filter = {};

    // If languageId provided → filter by language
    if (languageId) {
      if (!mongoose.Types.ObjectId.isValid(languageId)) {
        return res.status(400).json({ message: "Invalid language ID" });
      }
      filter.language = languageId;
    }

    const theories = await Theory.find(filter)
      .populate("language", "name")
      .sort({ createdAt: 1 });

    res.status(200).json(theories);
  } catch (error) {
    console.error("Error fetching theory:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/theory
 * @desc    Add new theory
 */
router.post("/", async (req, res) => {
  try {
    let { languageId, newLanguageName, title, content, codeExample } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Create language if needed
    if (!languageId && newLanguageName) {
      const name = newLanguageName.trim();

      let language = await Language.findOne({ name });
      if (!language) {
        language = await Language.create({ name });
      }

      languageId = language._id;
    }

    if (!mongoose.Types.ObjectId.isValid(languageId)) {
      return res.status(400).json({
        message: "Valid languageId or newLanguageName is required",
      });
    }

    const theory = await Theory.create({
      language: languageId,
      title,
      content,
      codeExample,
    });

    res.status(201).json(theory);
  } catch (error) {
    console.error("Error creating theory:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   DELETE /api/theory/:id
 * @desc    Delete theory by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid theory ID" });
    }

    const deletedTheory = await Theory.findByIdAndDelete(id);

    if (!deletedTheory) {
      return res.status(404).json({ message: "Theory not found" });
    }

    res.status(200).json({
      message: "Theory deleted successfully",
      deletedTheory,
    });
  } catch (error) {
    console.error("Error deleting theory:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;




