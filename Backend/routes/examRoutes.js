const express = require("express");

const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} = require("../controllers/examController");

const router = express.Router();

/*
====================================================
EXAM ROUTES
====================================================
*/

// GET all exams
router.get(
  "/",
  getExams
);

// GET one exam
router.get(
  "/:id",
  getExamById
);

// CREATE exam
router.post(
  "/",
  createExam
);

// UPDATE exam
router.put(
  "/:id",
  updateExam
);

// DELETE exam
router.delete(
  "/:id",
  deleteExam
);

module.exports = router;