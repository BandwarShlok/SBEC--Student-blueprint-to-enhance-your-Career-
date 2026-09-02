const express = require("express");

const {
  getDailyPlans,
  getDailyPlanById,
  createDailyPlan,
  updateDailyPlan,
  deleteDailyPlan,
  toggleDailyPlanComplete,
} = require("../controllers/dailyPlannerController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================
// STUDENT DAILY PLANNER
// =========================================

// Get student's daily plans
// GET /api/daily-planner
router.get("/", protect, getDailyPlans);

// Get one planner item
// GET /api/daily-planner/:id
router.get("/:id", protect, getDailyPlanById);

// Create planner item
// POST /api/daily-planner
router.post("/", protect, createDailyPlan);

// Update planner item
// PUT /api/daily-planner/:id
router.put("/:id", protect, updateDailyPlan);

// Delete planner item
// DELETE /api/daily-planner/:id
router.delete("/:id", protect, deleteDailyPlan);

// Mark complete / pending
// PATCH /api/daily-planner/:id/complete
router.patch(
  "/:id/complete",
  protect,
  toggleDailyPlanComplete
);

module.exports = router;