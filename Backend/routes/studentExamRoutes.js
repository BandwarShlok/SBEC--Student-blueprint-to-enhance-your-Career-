const express = require("express");

const {
  getStudentExams,
  getStudentExamById,
  createStudentExam,
  updateStudentExam,
  deleteStudentExam,
} = require("../controllers/studentExamController");

const protectUser = require("../middleware/authMiddleware");

const router = express.Router();

/*
====================================================
STUDENT EXAM PLANNER ROUTES
====================================================
*/

/*
GET ALL EXAMS
Only logged-in student's exams
*/
router.get(
  "/",
  protectUser,
  getStudentExams
);

/*
GET ONE EXAM
Only logged-in student's exam
*/
router.get(
  "/:id",
  protectUser,
  getStudentExamById
);

/*
CREATE EXAM
Automatically belongs to logged-in student
*/
router.post(
  "/",
  protectUser,
  createStudentExam
);

/*
UPDATE EXAM
Student can update only their own exam
*/
router.put(
  "/:id",
  protectUser,
  updateStudentExam
);

/*
DELETE EXAM
Student can delete only their own exam
*/
router.delete(
  "/:id",
  protectUser,
  deleteStudentExam
);

module.exports = router;