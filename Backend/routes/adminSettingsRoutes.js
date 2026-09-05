const express = require("express");

const {
  getSettings,
  updateSettings,
  changePassword,
} = require("../controllers/adminSettingsController");

const protectAdmin = require("../middleware/adminAuthMiddleware");

const router = express.Router();

// ============================================================
// GET ADMIN SETTINGS
// ============================================================

router.get("/", protectAdmin, getSettings);

// ============================================================
// UPDATE ADMIN SETTINGS
// ============================================================

router.put("/", protectAdmin, updateSettings);

// ============================================================
// CHANGE ADMIN PASSWORD
// ============================================================

router.put("/password", protectAdmin, changePassword);

module.exports = router;
