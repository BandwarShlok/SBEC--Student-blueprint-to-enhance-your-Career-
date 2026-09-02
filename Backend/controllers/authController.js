const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// STUDENT REGISTER

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      course,
      year,
      semester,
    } = req.body;

    // Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User with this email already exists.",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create student
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      course:
        course || "BSc Computer Science",
      year: year || "",
      semester: semester || "",
      role: "student",
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        year: user.year,
        semester: user.semester,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Register Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during registration.",
    });
  }
};

// STUDENT LOGIN

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // Find student
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // Make sure this is a student
    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "This account is not a student account.",
      });
    }

    // Compare password
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        year: user.year,
        semester: user.semester,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during login.",
    });
  }
};

// GET CURRENT STUDENT

const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        course: req.user.course,
        year: req.user.year,
        semester: req.user.semester,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error(
      "Get Current User Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get current student.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};