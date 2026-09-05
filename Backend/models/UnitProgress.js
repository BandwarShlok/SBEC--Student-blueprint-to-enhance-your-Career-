const mongoose = require("mongoose");

const unitProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    unitId: {
      type: String,
      required: true,
      trim: true,
    },

    unitName: {
      type: String,
      required: true,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/*
=========================================================
ONE PROGRESS RECORD PER STUDENT + SUBJECT + UNIT
=========================================================
*/

unitProgressSchema.index(
  {
    user: 1,
    subject: 1,
    unitId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "UnitProgress",
  unitProgressSchema
);