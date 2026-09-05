const express = require("express");

const protectUser = require("../middleware/authMiddleware");

const {
  getStudentSettings,
  updateStudentSettings,
  changeStudentPassword,
} = require("../controllers/studentSettingsController");

const router = express.Router();

// ============================================================
// STUDENT SETTINGS
// ============================================================

// GET /api/student/settings
router.get(
  "/",
  protectUser,
  getStudentSettings
);

// PUT /api/student/settings
router.put(
  "/",
  protectUser,
  updateStudentSettings
);

// PUT /api/student/settings/password
router.put(
  "/password",
  protectUser,
  changeStudentPassword
);

module.exports = router;