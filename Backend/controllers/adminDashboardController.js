const User = require("../models/User");
const Subject = require("../models/Subject");
const Note = require("../models/Note");
const Paper = require("../models/Paper");
const QuizQuestion = require("../models/QuizQuestion");
const WeeklyTest = require("../models/WeeklyTest");
const Exam = require("../models/Exam");

/* ADMIN DASHBOARD */

const getAdminDashboard = async (req, res) => {
  try {
    /* GET ALL COUNTS AT THE SAME TIME */

    const [
      totalStudents,
      totalSubjects,
      totalNotes,
      totalPapers,
      totalQuizzes,
      totalWeeklyTests,
      totalExams,
    ] = await Promise.all([
      User.countDocuments({
        role: "student",
      }),

      Subject.countDocuments(),

      Note.countDocuments(),

      Paper.countDocuments(),

      QuizQuestion.countDocuments(),

      WeeklyTest.countDocuments(),

      Exam.countDocuments(),
    ]);

    /* RECENT STUDENTS */

    const recentStudents = await User.find({
      role: "student",
    })
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    /* RESPONSE */

    res.status(200).json({
      success: true,

      stats: {
        totalStudents,
        totalSubjects,
        totalNotes,
        totalPapers,
        totalQuizzes,
        totalWeeklyTests,
        totalExams,
      },

      recentStudents,
    });
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "ADMIN DASHBOARD ERROR"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );

    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  getAdminDashboard,
};