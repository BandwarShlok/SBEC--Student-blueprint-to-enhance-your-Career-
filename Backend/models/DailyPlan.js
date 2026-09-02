const mongoose = require("mongoose");

const dailyPlanSchema = new mongoose.Schema(
  {
    // Student who owns this planner item
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Task / activity title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // Optional description
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Planner date
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // Optional start time
    startTime: {
      type: String,
      trim: true,
      default: "",
    },

    // Optional end time
    endTime: {
      type: String,
      trim: true,
      default: "",
    },

    // Task priority
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // Type of activity
    category: {
      type: String,
      enum: [
        "Study",
        "Assignment",
        "Revision",
        "Personal",
        "Other",
      ],
      default: "Study",
    },

    // Completion status
    completed: {
      type: Boolean,
      default: false,
    },

    // Stores when the task was completed
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================
// INDEX
// =========================================
// Helps quickly find a student's planner
// for a particular date.

dailyPlanSchema.index({
  user: 1,
  date: 1,
});

module.exports = mongoose.model("DailyPlan", dailyPlanSchema);