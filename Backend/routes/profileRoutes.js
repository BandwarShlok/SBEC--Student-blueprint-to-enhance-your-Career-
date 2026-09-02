const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const protectUser = require("../middleware/authMiddleware");

const router = express.Router();


// GET CURRENT USER PROFILE
router.get(
  "/",
  protectUser,
  getProfile
);


// UPDATE CURRENT USER PROFILE
router.put(
  "/",
  protectUser,
  updateProfile
);


module.exports = router;