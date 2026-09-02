const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");

const protectUser = require("../middleware/authMiddleware");

const router = express.Router();

// STUDENT REGISTER
// POST /api/auth/register

router.post(
  "/register",
  registerUser
);

// STUDENT LOGIN
// POST /api/auth/login

router.post(
  "/login",
  loginUser
);

// CURRENT STUDENT
// GET /api/auth/me

router.get(
  "/me",
  protectUser,
  getCurrentUser
);

module.exports = router;