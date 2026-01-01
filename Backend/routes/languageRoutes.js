// routes/languageRoutes.js
import express from "express";
import mongoose from "mongoose";
import Language from "../models/Language.js";

const router = express.Router();

// @route   GET /api/languages
// @desc    Get all languages
router.get("/", async (req, res) => {
  try {
    const languages = await Language.find().sort({ createdAt: -1 });
    res.json(languages);
  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/languages/:id
// @desc    Get single language by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ VALIDATE OBJECT ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid language ID" });
    }

    const language = await Language.findById(id);

    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }

    res.json(language);
  } catch (error) {
    console.error("Error fetching language:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/languages
// @desc    Add a new language
router.post("/", async (req, res) => {
  try {
    const { name, description, logo } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Language name is required" });
    }

    const existing = await Language.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Language already exists" });
    }

    const language = await Language.create({
      name: name.trim(),
      description: description || "",
      logo: logo || "",
    });

    res.status(201).json(language);
  } catch (error) {
    console.error("Error creating language:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
