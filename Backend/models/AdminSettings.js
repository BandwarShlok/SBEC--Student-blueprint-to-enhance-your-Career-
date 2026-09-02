const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
    },

    notifications: {
      type: Boolean,
      default: true,
    },

    studentRegistration: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AdminSettings",
  adminSettingsSchema
);