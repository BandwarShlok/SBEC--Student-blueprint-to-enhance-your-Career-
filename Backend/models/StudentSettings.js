const mongoose = require("mongoose");

const studentSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    notifications: {
      email: {
        type: Boolean,
        default: true,
      },

      examReminders: {
        type: Boolean,
        default: true,
      },

      quizResults: {
        type: Boolean,
        default: true,
      },
    },

    appearance: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "dark",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "StudentSettings",
  studentSettingsSchema
);