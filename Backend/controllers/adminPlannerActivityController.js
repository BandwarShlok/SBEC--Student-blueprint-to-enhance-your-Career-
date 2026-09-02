const DailyPlan = require("../models/DailyPlan");
const User = require("../models/User");

/*
========================================================
GET STUDENT PLANNER ACTIVITY
========================================================

GET
/api/admin/daily-planner/activity/:userId

Query:
?startDate=2026-08-31&endDate=2026-09-06

Admin only.
Read only.
*/

const getStudentPlannerActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    /*
    ======================================================
    VALIDATE STUDENT
    ======================================================
    */

    const student = await User.findOne({
      _id: userId,
      role: "student",
    }).select(
      "_id name email course year semester"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    /*
    ======================================================
    VALIDATE DATES
    ======================================================
    */

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "startDate and endDate are required.",
      });
    }

    const start = new Date(
      `${startDate}T00:00:00`
    );

    const end = new Date(
      `${endDate}T23:59:59.999`
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format.",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message:
          "Start date cannot be after end date.",
      });
    }

    /*
    ======================================================
    GET PLANS
    ======================================================
    */

    const plans = await DailyPlan.find({
      user: userId,
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .select(
        "title description date startTime endTime priority category completed completedAt"
      )
      .sort({
        date: 1,
        startTime: 1,
        createdAt: 1,
      });

    /*
    ======================================================
    CREATE DAILY SUMMARY
    ======================================================
    */

    const dailyActivity = [];

    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateKey =
        formatDate(currentDate);

      const dayPlans = plans.filter(
        (plan) => {
          return (
            formatDate(
              new Date(plan.date)
            ) === dateKey
          );
        }
      );

      const totalTasks =
        dayPlans.length;

      const completedTasks =
        dayPlans.filter(
          (plan) => plan.completed
        ).length;

      const pendingTasks =
        totalTasks - completedTasks;

      const completionPercentage =
        totalTasks === 0
          ? 0
          : Math.round(
              (completedTasks /
                totalTasks) *
                100
            );

      dailyActivity.push({
        date: dateKey,
        totalTasks,
        completedTasks,
        pendingTasks,
        completionPercentage,
      });

      currentDate.setDate(
        currentDate.getDate() + 1
      );
    }

    /*
    ======================================================
    OVERALL SUMMARY
    ======================================================
    */

    const totalTasks =
      plans.length;

    const completedTasks =
      plans.filter(
        (plan) => plan.completed
      ).length;

    const pendingTasks =
      totalTasks - completedTasks;

    const completionPercentage =
      totalTasks === 0
        ? 0
        : Math.round(
            (completedTasks /
              totalTasks) *
              100
          );

    /*
    ======================================================
    RESPONSE
    ======================================================
    */

    return res.status(200).json({
      success: true,

      student,

      period: {
        startDate,
        endDate,
      },

      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionPercentage,
      },

      dailyActivity,

      plans,
    });
  } catch (error) {
    console.error(
      "Admin Planner Activity Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load planner activity.",
    });
  }
};

/*
========================================================
DATE FORMATTER
========================================================
*/

const formatDate = (date) => {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

module.exports = {
  getStudentPlannerActivity,
};