const mongoose = require("mongoose");

/*
=========================================================
TOPIC SCHEMA
=========================================================
*/

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: true,
  },
);

/*
=========================================================
UNIT SCHEMA
=========================================================
*/

const unitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    topics: {
      type: [topicSchema],
      default: [],
    },
  },
  {
    _id: true,
  },
);

/*
=========================================================
SUBJECT SCHEMA
=========================================================
*/

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    course: {
      type: String,
      default: "B.Sc Computer Science",
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

    description: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    =====================================================
    UNITS + TOPICS
    =====================================================
    */

    units: {
      type: [unitSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Subject", subjectSchema);
