const express = require("express");

const protectUser = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const router = express.Router();

/*
=========================================================
GET CURRENT USER PROFILE
=========================================================

GET /api/profile
=========================================================
*/

router.get("/", protectUser, getProfile);

/*
=========================================================
UPDATE CURRENT USER PROFILE
=========================================================

PUT /api/profile
=========================================================
*/

router.put("/", protectUser, updateProfile);

module.exports = router;
