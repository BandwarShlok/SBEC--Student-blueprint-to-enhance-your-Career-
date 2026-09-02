const express = require("express");

const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/quizController");

const router = express.Router();

// ============================================================
// GET ALL QUESTIONS
// GET /api/admin/quiz
// ============================================================

router.get(
  "/",
  getQuestions
);

// ============================================================
// GET SINGLE QUESTION
// GET /api/admin/quiz/:id
// ============================================================

router.get(
  "/:id",
  getQuestionById
);

// ============================================================
// CREATE QUESTION
// POST /api/admin/quiz
// ============================================================

router.post(
  "/",
  createQuestion
);

// ============================================================
// UPDATE QUESTION
// PUT /api/admin/quiz/:id
// ============================================================

router.put(
  "/:id",
  updateQuestion
);

// ============================================================
// DELETE QUESTION
// DELETE /api/admin/quiz/:id
// ============================================================

router.delete(
  "/:id",
  deleteQuestion
);

module.exports = router;