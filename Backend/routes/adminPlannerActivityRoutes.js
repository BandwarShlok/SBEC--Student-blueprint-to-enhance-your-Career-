const express = require("express");

const {
  getStudentPlannerActivity,
} = require(
  "../controllers/adminPlannerActivityController"
);

const protectAdmin = require(
  "../middleware/adminAuthMiddleware"
);

const router = express.Router();

/*
========================================================
GET STUDENT PLANNER ACTIVITY
========================================================
*/

router.get(
  "/:userId",
  protectAdmin,
  getStudentPlannerActivity
);

module.exports = router;