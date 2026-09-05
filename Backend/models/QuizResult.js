const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    correct: {
      type: Number,
      required: true,
      min: 0,
    },

    wrong: {
      type: Number,
      required: true,
      min: 0,
    },

    unanswered: {
      type: Number,
      required: true,
      min: 0,
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
