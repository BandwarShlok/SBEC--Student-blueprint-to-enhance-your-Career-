const express = require("express");

const {
  getStudentsForPlanner,
  getStudentDailyPlans,
  getStudentDailyPlanById,
} = require("../controllers/adminDailyPlannerController");

const protectAdmin = require("../middleware/adminAuthMiddleware");

const router = express.Router();

/*
=========================================================
ADMIN DAILY PLANNER
READ ONLY
=========================================================
*/

/*
Get all students
GET /api/admin/daily-planner/students
*/
router.get(
  "/students",
  protectAdmin,
  getStudentsForPlanner
);


/*
Get selected student's planner
GET /api/admin/daily-planner/student/:userId?date=YYYY-MM-DD
*/
router.get(
  "/student/:userId",
  protectAdmin,
  getStudentDailyPlans
);


/*
Get single planner item
GET /api/admin/daily-planner/plan/:planId
*/
router.get(
  "/plan/:planId",
  protectAdmin,
  getStudentDailyPlanById
);


module.exports = router;