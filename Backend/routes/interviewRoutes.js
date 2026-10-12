// routes/interviewRoutes.js
// Keep a personal bank of the interview questions you have actually been asked,
// so they can be searched, revised and marked as mastered over time.
import express from "express";
import mongoose from "mongoose";
import InterviewQuestion from "../models/InterviewQuestion.js";
import { identify } from "../middleware/identify.js";

const router = express.Router();
router.use(identify);

const sendError = (res, status, message) => res.status(status).json({ message });

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const DIFFICULTIES = ["easy", "medium", "hard"];
const STATUSES = ["saved", "practicing", "mastered"];

/** Normalise an array or comma-separated string into at most 10 clean tags. */
const cleanTags = (value) => {
  const list = Array.isArray(value) ? value : String(value || "").split(",");
  return list
    .map((tag) => String(tag).trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 10);
};

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Shape a question for the client. */
const present = (item) => ({
  _id: item._id,
  question: item.question,
  answer: item.answer,
  company: item.company,
  role: item.role,
  category: item.category,
  difficulty: item.difficulty,
  status: item.status,
  tags: item.tags,
  starred: item.starred,
  timesAsked: item.timesAsked,
  lastAskedAt: item.lastAskedAt,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

// @route   GET /api/interview
// @desc    List the user's saved questions with search, filters and sorting
// @access  Private
router.get("/", async (req, res) => {
  try {
    const { search, category, difficulty, status, starred, sort } = req.query;
    const query = { user: req.user._id };

    if (category) query.category = String(category).trim();
    if (DIFFICULTIES.includes(difficulty)) query.difficulty = difficulty;
    if (STATUSES.includes(status)) query.status = status;
    if (starred === "true") query.starred = true;

    if (search) {
      const safe = escapeRegex(String(search).trim());
      if (safe) {
        query.$or = [
          { question: new RegExp(safe, "i") },
          { answer: new RegExp(safe, "i") },
          { company: new RegExp(safe, "i") },
          { tags: new RegExp(safe, "i") },
        ];
      }
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      company: { company: 1 },
      difficulty: { difficulty: 1 },
      asked: { timesAsked: -1 },
    };

    const items = await InterviewQuestion.find(query).sort(
      sortMap[sort] || sortMap.newest
    );

    res.json(items.map(present));
  } catch (err) {
    console.error("GET /api/interview:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   GET /api/interview/stats
// @desc    Counts for the dashboard strip and the category filter
// @access  Private
router.get("/stats", async (req, res) => {
  try {
    const items = await InterviewQuestion.find({ user: req.user._id })
      .select("category difficulty status starred company timesAsked")
      .lean();

    const companies = new Set(
      items.map((item) => (item.company || "").trim()).filter(Boolean)
    );

    res.json({
      total: items.length,
      saved: items.filter((item) => item.status === "saved").length,
      practicing: items.filter((item) => item.status === "practicing").length,
      mastered: items.filter((item) => item.status === "mastered").length,
      starred: items.filter((item) => item.starred).length,
      companies: companies.size,
      timesAsked: items.reduce((sum, item) => sum + (item.timesAsked || 0), 0),
      byDifficulty: {
        easy: items.filter((item) => item.difficulty === "easy").length,
        medium: items.filter((item) => item.difficulty === "medium").length,
        hard: items.filter((item) => item.difficulty === "hard").length,
      },
      categories: [...new Set(items.map((item) => item.category).filter(Boolean))].sort(),
    });
  } catch (err) {
    console.error("GET /api/interview/stats:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   GET /api/interview/:id
// @desc    Fetch one question
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid question ID");

    const item = await InterviewQuestion.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!item) return sendError(res, 404, "Question not found");

    res.json(present(item));
  } catch (err) {
    console.error("GET /api/interview/:id:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   POST /api/interview
// @desc    Save a question that came up in an interview
// @access  Private
router.post("/", async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();
    if (!question) return sendError(res, 400, "A question is required.");

    const created = await InterviewQuestion.create({
      user: req.user._id,
      question: question.slice(0, 2000),
      answer: String(req.body?.answer || "").trim().slice(0, 20000),
      company: String(req.body?.company || "").trim().slice(0, 120),
      role: String(req.body?.role || "").trim().slice(0, 120),
      category:
        String(req.body?.category || "General").trim().slice(0, 60) || "General",
      difficulty: DIFFICULTIES.includes(req.body?.difficulty)
        ? req.body.difficulty
        : "medium",
      status: STATUSES.includes(req.body?.status) ? req.body.status : "saved",
      tags: cleanTags(req.body?.tags),
      starred: Boolean(req.body?.starred),
    });

    res.status(201).json(present(created));
  } catch (err) {
    console.error("POST /api/interview:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   PATCH /api/interview/:id
// @desc    Edit a question, its answer, tags or status
// @access  Private
router.patch("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid question ID");

    const body = req.body || {};
    const updates = {};

    if (typeof body.question === "string" && body.question.trim()) {
      updates.question = body.question.trim().slice(0, 2000);
    }
    if (typeof body.answer === "string") {
      updates.answer = body.answer.trim().slice(0, 20000);
    }
    if (typeof body.company === "string") {
      updates.company = body.company.trim().slice(0, 120);
    }
    if (typeof body.role === "string") {
      updates.role = body.role.trim().slice(0, 120);
    }
    if (typeof body.category === "string" && body.category.trim()) {
      updates.category = body.category.trim().slice(0, 60);
    }
    if (DIFFICULTIES.includes(body.difficulty)) updates.difficulty = body.difficulty;
    if (STATUSES.includes(body.status)) updates.status = body.status;
    if (Array.isArray(body.tags) || typeof body.tags === "string") {
      updates.tags = cleanTags(body.tags);
    }
    if (typeof body.starred === "boolean") updates.starred = body.starred;

    if (!Object.keys(updates).length) return sendError(res, 400, "Nothing to update.");

    const item = await InterviewQuestion.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updates },
      { new: true }
    );
    if (!item) return sendError(res, 404, "Question not found");

    res.json(present(item));
  } catch (err) {
    console.error("PATCH /api/interview/:id:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   POST /api/interview/:id/review
// @desc    Record that this question came up again
// @access  Private
router.post("/:id/review", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid question ID");

    const item = await InterviewQuestion.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $inc: { timesAsked: 1 }, $set: { lastAskedAt: new Date() } },
      { new: true }
    );
    if (!item) return sendError(res, 404, "Question not found");

    res.json(present(item));
  } catch (err) {
    console.error("POST /api/interview/:id/review:", err.message);
    sendError(res, 500, "Server error");
  }
});

// @route   DELETE /api/interview/:id
// @desc    Forget a question
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid question ID");

    const item = await InterviewQuestion.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!item) return sendError(res, 404, "Question not found");

    res.json({ message: "Question deleted", id: req.params.id });
  } catch (err) {
    console.error("DELETE /api/interview/:id:", err.message);
    sendError(res, 500, "Server error");
  }
});

export default router;
