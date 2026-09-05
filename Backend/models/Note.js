const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Subject
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    // Embedded Unit ID from Subject.units._id
    unit: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // Note description
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Actual note content
    content: {
      type: String,
      default: "",
      trim: true,
    },

    // Optional PDF/file support for future use
    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },

    fileName: {
      type: String,
      default: "",
      trim: true,
    },

    year: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Note", noteSchema);
