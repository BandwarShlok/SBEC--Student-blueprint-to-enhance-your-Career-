const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ========================================
    // BASIC ACCOUNT INFORMATION
    // ========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ========================================
    // PERSONAL INFORMATION
    // ========================================

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================
    // ACADEMIC INFORMATION
    // ========================================

    college: {
      type: String,
      default: "",
      trim: true,
    },

    course: {
      type: String,
      default: "BSc Computer Science",
      trim: true,
    },

    year: {
      type: String,
      default: "",
      trim: true,
    },

    semester: {
      type: String,
      default: "",
      trim: true,
    },

    rollNumber: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================
    // STUDY PREFERENCES
    // ========================================

    studyHours: {
      type: String,
      default: "2",
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    priority: {
      type: String,
      enum: [
        "Exam Preparation",
        "Daily Learning",
        "Improve Weak Subjects",
        "Complete Syllabus",
      ],
      default: "Exam Preparation",
    },

    subjects: {
      type: [String],
      default: [],
    },

    // ========================================
    // USER ROLE
    // ========================================

    role: {
      type: String,
      default: "student",
      enum: ["student"],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
