const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
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

    optionA: {
      type: String,
      required: true,
      trim: true,
    },

    optionB: {
      type: String,
      required: true,
      trim: true,
    },

    optionC: {
      type: String,
      required: true,
      trim: true,
    },

    optionD: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "QuizQuestion",
  quizQuestionSchema
);