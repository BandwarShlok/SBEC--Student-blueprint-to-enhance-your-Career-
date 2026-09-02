const mongoose = require("mongoose");
const DailyPlan = require("../models/DailyPlan");

// =========================================
// GET STUDENT DAILY PLANS
// GET /api/daily-planner
// =========================================

const getDailyPlans = async (req, res) => {
  try {
    const { date } = req.query;

    const filter = {
      user: req.user._id,
    };

    // Filter by selected date if provided
    if (date) {
      const selectedDate = new Date(date);

      if (Number.isNaN(selectedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const plans = await DailyPlan.find(filter)
      .sort({
        date: 1,
        startTime: 1,
        createdAt: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    console.error("Get Daily Plans Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily plans",
    });
  }
};


// =========================================
// GET SINGLE DAILY PLAN
// GET /api/daily-planner/:id
// =========================================

const getDailyPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid planner ID",
      });
    }

    const plan = await DailyPlan.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Daily plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Get Daily Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily plan",
    });
  }
};


// =========================================
// CREATE DAILY PLAN
// POST /api/daily-planner
// =========================================

const createDailyPlan = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      priority,
      category,
    } = req.body;

    // Required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // Normalize date to the beginning of the selected day
    parsedDate.setHours(0, 0, 0, 0);

    const plan = await DailyPlan.create({
      user: req.user._id,

      title: title.trim(),

      description:
        typeof description === "string"
          ? description.trim()
          : "",

      date: parsedDate,

      startTime:
        typeof startTime === "string"
          ? startTime.trim()
          : "",

      endTime:
        typeof endTime === "string"
          ? endTime.trim()
          : "",

      priority: priority || "Medium",

      category: category || "Study",

      completed: false,

      completedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Daily plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("Create Daily Plan Error:", error);

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create daily plan",
    });
  }
};


// =========================================
// UPDATE DAILY PLAN
// PUT /api/daily-planner/:id
// =========================================

const updateDailyPlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid planner ID",
      });
    }

    const plan = await DailyPlan.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Daily plan not found",
      });
    }

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      priority,
      category,
    } = req.body;

    // Update only supplied fields
    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title cannot be empty",
        });
      }

      plan.title = String(title).trim();
    }

    if (description !== undefined) {
      plan.description = String(description).trim();
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      parsedDate.setHours(0, 0, 0, 0);

      plan.date = parsedDate;
    }

    if (startTime !== undefined) {
      plan.startTime = String(startTime).trim();
    }

    if (endTime !== undefined) {
      plan.endTime = String(endTime).trim();
    }

    if (priority !== undefined) {
      plan.priority = priority;
    }

    if (category !== undefined) {
      plan.category = category;
    }

    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Daily plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Update Daily Plan Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update daily plan",
    });
  }
};


// =========================================
// DELETE DAILY PLAN
// DELETE /api/daily-planner/:id
// =========================================

const deleteDailyPlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid planner ID",
      });
    }

    const plan = await DailyPlan.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Daily plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Daily plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete Daily Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete daily plan",
    });
  }
};


// =========================================
// TOGGLE COMPLETE
// PATCH /api/daily-planner/:id/complete
// =========================================

const toggleDailyPlanComplete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid planner ID",
      });
    }

    const plan = await DailyPlan.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Daily plan not found",
      });
    }

    plan.completed = !plan.completed;

    plan.completedAt = plan.completed
      ? new Date()
      : null;

    await plan.save();

    return res.status(200).json({
      success: true,
      message: plan.completed
        ? "Task marked as completed"
        : "Task marked as pending",
      plan,
    });
  } catch (error) {
    console.error(
      "Toggle Daily Plan Complete Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update task status",
    });
  }
};


// =========================================
// EXPORT
// =========================================

module.exports = {
  getDailyPlans,
  getDailyPlanById,
  createDailyPlan,
  updateDailyPlan,
  deleteDailyPlan,
  toggleDailyPlanComplete,
};