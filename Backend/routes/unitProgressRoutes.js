const express = require("express");

const protectUser = require("../middleware/authMiddleware");

const {
  getSubjectProgress,
  getAllProgress,
  toggleUnitProgress,
} = require("../controllers/unitProgressController");

const router = express.Router();

/*
=========================================================
GET ALL CURRENT STUDENT PROGRESS
=========================================================
*/

router.get(
  "/",
  protectUser,
  getAllProgress
);

/*
=========================================================
GET PROGRESS FOR ONE SUBJECT
=========================================================
*/

router.get(
  "/subject/:subjectId",
  protectUser,
  getSubjectProgress
);

/*
=========================================================
MARK UNIT COMPLETE / INCOMPLETE
=========================================================
*/

router.patch(
  "/subject/:subjectId/unit/:unitId",
  protectUser,
  toggleUnitProgress
);

module.exports = router;