const express = require("express");

const {
  getQuizSubjects,
  getStudentQuiz,
  submitStudentQuiz,
} = require("../controllers/studentQuizController");

const protectUser = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// GET QUIZ SUBJECTS
// GET /api/quiz/subjects
// ============================================================

router.get(
  "/subjects",
  protectUser,
  getQuizSubjects
);

// ============================================================
// GET QUIZ QUESTIONS
// GET /api/quiz?subject=Artificial%20Intelligence&limit=5
// ============================================================

router.get(
  "/",
  protectUser,
  getStudentQuiz
);

// ============================================================
// SUBMIT QUIZ
// POST /api/quiz/submit
// ============================================================

router.post(
  "/submit",
  protectUser,
  submitStudentQuiz
);

module.exports = router;