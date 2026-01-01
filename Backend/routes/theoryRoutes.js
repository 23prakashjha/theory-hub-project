import express from "express";
import mongoose from "mongoose";
import Theory from "../models/Theory.js";
import Language from "../models/Language.js";

const router = express.Router();

/**
 * @route   GET /api/theory
 * @desc    Get all theory for a language
 * @query   languageId
 */
router.get("/", async (req, res) => {
  try {
    const { languageId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(languageId)) {
      return res.status(400).json({ message: "Invalid language ID" });
    }

    const theories = await Theory.find({ language: languageId })
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
      language: languageId,   // ✅ CORRECT FIELD
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

export default router;





