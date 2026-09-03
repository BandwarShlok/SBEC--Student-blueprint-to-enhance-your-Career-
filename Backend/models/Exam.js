const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    // Student who owns this personal exam.
    // Optional so existing admin-created exams continue to work.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    examDate: {
      type: Date,
      required: true,
    },

    examTime: {
      type: String,
      trim: true,
      default: "",
    },

    year: {
      type: Number,
      required: true,
    },

    semester: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: Number,
      default: 180,
    },

    examType: {
      type: String,
      enum: ["University", "Internal", "Practical", "Viva", "Other"],
      default: "University",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    questions: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Helps quickly find exams belonging to a particular student.
examSchema.index({
  user: 1,
  examDate: 1,
});

module.exports = mongoose.model("Exam", examSchema);
