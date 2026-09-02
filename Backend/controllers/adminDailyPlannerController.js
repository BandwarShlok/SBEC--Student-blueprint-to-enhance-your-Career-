const DailyPlan = require("../models/DailyPlan");
const User = require("../models/User");

/*
=========================================================
GET ALL STUDENTS
Admin can select a student from the list.
READ ONLY
=========================================================
*/

const getStudentsForPlanner = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
    })
      .select("_id name email course year semester")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error(
      "Admin Get Students Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load students.",
    });
  }
};


/*
=========================================================
GET STUDENT DAILY PLANS
Admin can view plans for a selected student and date.
READ ONLY
=========================================================
*/

const getStudentDailyPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    /*
    -----------------------------------------
    Validate student
    -----------------------------------------
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
    -----------------------------------------
    Build query
    -----------------------------------------
    */

    const query = {
      user: userId,
    };


    /*
    -----------------------------------------
    Date filtering
    -----------------------------------------
    */

    if (date) {
      const selectedDate = new Date(`${date}T00:00:00`);

      if (Number.isNaN(selectedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format.",
        });
      }

      const startOfDay = new Date(selectedDate);

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      const endOfDay = new Date(selectedDate);

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }


    /*
    -----------------------------------------
    Get plans
    -----------------------------------------
    */

    const plans = await DailyPlan.find(query)
      .populate(
        "user",
        "name email course year semester"
      )
      .sort({
        startTime: 1,
        createdAt: 1,
      });


    /*
    -----------------------------------------
    Response
    -----------------------------------------
    */

    return res.status(200).json({
      success: true,

      student,

      date: date || null,

      total: plans.length,

      plans,
    });

  } catch (error) {
    console.error(
      "Admin Get Daily Plans Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load student's daily planner.",
    });
  }
};


/*
=========================================================
GET SINGLE DAILY PLAN
READ ONLY
=========================================================
*/

const getStudentDailyPlanById = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await DailyPlan.findById(planId)
      .populate(
        "user",
        "name email course year semester"
      );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Daily plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      plan,
    });

  } catch (error) {
    console.error(
      "Admin Get Daily Plan Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load daily plan.",
    });
  }
};


module.exports = {
  getStudentsForPlanner,
  getStudentDailyPlans,
  getStudentDailyPlanById,
};