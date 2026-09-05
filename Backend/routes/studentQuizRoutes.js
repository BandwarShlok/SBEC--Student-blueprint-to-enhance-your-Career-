const express = require("express");

const {
  getQuizSubjects,
  getStudentQuiz,
  submitStudentQuiz,
  getStudentQuizResults,
} = require("../controllers/studentQuizController");

const protectUser = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// GET QUIZ SUBJECTS
// GET /api/quiz/subjects
// ============================================================

router.get("/subjects", protectUser, getQuizSubjects);

// ============================================================
// GET QUIZ QUESTIONS
// GET /api/quiz?subject=AI&unit=Unit%201&limit=5
// ============================================================

router.get("/", protectUser, getStudentQuiz);

// ============================================================
// GET STUDENT QUIZ RESULTS
// GET /api/quiz/results
// ============================================================

router.get("/results", protectUser, getStudentQuizResults);

// ============================================================
// SUBMIT QUIZ
// POST /api/quiz/submit
// ============================================================

router.post("/submit", protectUser, submitStudentQuiz);

module.exports = router;
