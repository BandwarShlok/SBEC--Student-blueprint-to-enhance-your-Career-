const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
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

    questions: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Exam", examSchema);
