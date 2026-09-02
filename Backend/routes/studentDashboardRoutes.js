const express = require("express");

const protectStudent = require(
  "../middleware/authMiddleware"
);

const {
  getStudentDashboard,
} = require(
  "../controllers/studentDashboardController"
);

const router = express.Router();

// =====================================================
// STUDENT DASHBOARD
// =====================================================

router.get(
  "/",
  protectStudent,
  getStudentDashboard
);

module.exports = router;