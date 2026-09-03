const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    // Subject this note belongs to
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    // Unit number
    unit: {
      type: Number,
      required: true,
      min: 1,
    },

    // Note title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Short description
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Full note content
    content: {
      type: String,
      required: true,
      trim: true,
    },

    // Academic year
    year: {
      type: String,
      required: true,
      trim: true,
    },

    // Semester
    semester: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional uploaded file
    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // Original file name
    fileName: {
      type: String,
      default: "",
      trim: true,
    },

    // Admin who created the note
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Makes subject + unit lookups faster
noteSchema.index({
  subject: 1,
  unit: 1,
});

module.exports = mongoose.model("Note", noteSchema);