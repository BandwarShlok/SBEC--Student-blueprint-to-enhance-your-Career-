const User = require("../models/User");
const Subject = require("../models/Subject");
const Note = require("../models/Note");
const Paper = require("../models/Paper");
const QuizQuestion = require("../models/QuizQuestion");
const Exam = require("../models/Exam");
const DailyPlan = require("../models/DailyPlan");
const UnitProgress = require("../models/UnitProgress");
const QuizResult = require("../models/QuizResult");

// ============================================================
// GET STUDENT DASHBOARD
// ============================================================

const getStudentDashboard = async (req, res) => {
  try {
    // ==========================================================
    // STUDENT ID
    // ==========================================================

    const studentId = req.user?._id || req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required.",
      });
    }

    // ==========================================================
    // STUDENT
    // ==========================================================

    const student = await User.findById(studentId).select("-password").lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // ==========================================================
    // STUDENT YEAR / SEMESTER
    // ==========================================================

    const studentYear = String(student.year || "").trim();

    const studentSemester = String(student.semester || "").trim();

    // ==========================================================
    // SUBJECTS
    //
    // First try:
    // Year + Semester
    //
    // Then:
    // Year
    //
    // Then:
    // Semester
    //
    // Finally:
    // All active subjects
    // ==========================================================

    const activeSubjectFilter = {
      isActive: {
        $ne: false,
      },
    };

    let subjects = [];

    // ==========================================================
    // 1. YEAR + SEMESTER
    // ==========================================================

    if (studentYear && studentSemester) {
      subjects = await Subject.find({
        ...activeSubjectFilter,
        year: studentYear,
        semester: studentSemester,
      })
        .sort({
          name: 1,
        })
        .lean();
    }

    // ==========================================================
    // 2. YEAR ONLY
    // ==========================================================

    if (subjects.length === 0 && studentYear) {
      subjects = await Subject.find({
        ...activeSubjectFilter,
        year: studentYear,
      })
        .sort({
          name: 1,
        })
        .lean();
    }

    // ==========================================================
    // 3. SEMESTER ONLY
    // ==========================================================

    if (subjects.length === 0 && studentSemester) {
      subjects = await Subject.find({
        ...activeSubjectFilter,
        semester: studentSemester,
      })
        .sort({
          name: 1,
        })
        .lean();
    }

    // ==========================================================
    // 4. ALL ACTIVE SUBJECTS
    // ==========================================================

    if (subjects.length === 0) {
      subjects = await Subject.find(activeSubjectFilter)
        .sort({
          name: 1,
        })
        .lean();
    }

    // ==========================================================
    // SUBJECT IDS
    // ==========================================================

    const subjectIds = subjects.map((subject) => subject._id);

    // ==========================================================
    // GET COMPLETED UNIT PROGRESS
    // ==========================================================

    const completedProgress =
      subjectIds.length > 0
        ? await UnitProgress.find({
            user: studentId,

            subject: {
              $in: subjectIds,
            },

            completed: true,
          }).lean()
        : [];

    // ==========================================================
    // GROUP COMPLETED UNITS BY SUBJECT
    // ==========================================================

    const completedUnitsBySubject = new Map();

    completedProgress.forEach((item) => {
      const subjectId = String(item.subject);

      if (!completedUnitsBySubject.has(subjectId)) {
        completedUnitsBySubject.set(subjectId, new Set());
      }

      completedUnitsBySubject.get(subjectId).add(String(item.unitId));
    });

    // ==========================================================
    // NOTES FILTER
    // ==========================================================

    const noteFilter = {};

    if (studentYear) {
      noteFilter.year = studentYear;
    }

    if (studentSemester) {
      noteFilter.semester = studentSemester;
    }

    // ==========================================================
    // TOTAL NOTES
    // ==========================================================

    const totalNotes = await Note.countDocuments(noteFilter);

    // ==========================================================
    // PAPERS FILTER
    // ==========================================================

    const paperFilter = {};

    if (studentSemester) {
      paperFilter.semester = studentSemester;
    }

    const numericStudentYear = Number(studentYear);

    if (studentYear && Number.isFinite(numericStudentYear)) {
      paperFilter.year = numericStudentYear;
    }

    // ==========================================================
    // TOTAL PAPERS
    // ==========================================================

    const totalPapers = await Paper.countDocuments(paperFilter);

    // ==========================================================
    // TOTAL QUIZ QUESTIONS
    // ==========================================================

    const totalQuizQuestions = await QuizQuestion.countDocuments();

    // ==========================================================
    // TODAY
    // ==========================================================

    const today = new Date();

    const startOfToday = new Date(today);

    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);

    endOfToday.setHours(23, 59, 59, 999);

    // ==========================================================
    // EXAMS
    // ==========================================================

    let upcomingExams = [];

    try {
      upcomingExams = await Exam.find({
        examDate: {
          $gte: startOfToday,
        },
      })
        .sort({
          examDate: 1,
        })
        .limit(10)
        .lean();
    } catch (examError) {
      console.error("Dashboard Exam Error:", examError);

      upcomingExams = [];
    }

    const upcomingExamsLimited = Array.isArray(upcomingExams)
      ? upcomingExams
      : [];

    // ==========================================================
    // DAILY PLANNER
    // ==========================================================

    let todayPlans = [];

    try {
      todayPlans = await DailyPlan.find({
        user: studentId,

        date: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      })
        .sort({
          startTime: 1,
        })
        .lean();
    } catch (plannerError) {
      console.error("Dashboard Planner Error:", plannerError);

      todayPlans = [];
    }

    const totalPlannerTasks = todayPlans.length;

    const completedPlannerTasks = todayPlans.filter(
      (plan) => plan.completed === true,
    ).length;

    const pendingPlannerTasks = totalPlannerTasks - completedPlannerTasks;

    const plannerCompletionPercentage =
      totalPlannerTasks > 0
        ? Math.round((completedPlannerTasks / totalPlannerTasks) * 100)
        : 0;

    // ==========================================================
    // SUBJECT DATA
    //
    // IMPORTANT:
    //
    // Subject Progress is based ONLY on completed units.
    //
    // completed units
    // ---------------- × 100
    // total units
    //
    // DO NOT MIX QUIZ RESULTS INTO SUBJECT PROGRESS.
    // ==========================================================

    const subjectData = await Promise.all(
      subjects.map(async (subject) => {
        const subjectId = subject._id;

        // ==================================================
        // UNITS
        // ==================================================

        const units = Array.isArray(subject.units) ? subject.units : [];

        const totalUnits = units.length;

        // ==================================================
        // COMPLETED UNIT IDS
        // ==================================================

        const completedSet =
          completedUnitsBySubject.get(String(subjectId)) || new Set();

        // ==================================================
        // ONLY COUNT VALID UNITS
        // ==================================================

        const validCompletedUnits = units.filter((unit) =>
          completedSet.has(String(unit._id)),
        ).length;

        // ==================================================
        // REAL SUBJECT PROGRESS
        // ==================================================

        const progress =
          totalUnits > 0
            ? Math.round((validCompletedUnits / totalUnits) * 100)
            : 0;

        // ==================================================
        // NOTES COUNT
        // ==================================================

        let notesCount = 0;

        try {
          notesCount = await Note.countDocuments({
            subject: subjectId,
          });
        } catch (error) {
          console.error("Subject Notes Count Error:", error);

          notesCount = 0;
        }

        // ==================================================
        // QUIZ QUESTION COUNT
        // ==================================================

        let quizCount = 0;

        try {
          quizCount = await QuizQuestion.countDocuments({
            subject: subject.name,
          });
        } catch (error) {
          console.error("Subject Quiz Count Error:", error);

          quizCount = 0;
        }

        // ==================================================
        // PAPERS COUNT
        // ==================================================

        let papersCount = 0;

        try {
          papersCount = await Paper.countDocuments({
            subject: subject.name,
          });
        } catch (error) {
          console.error("Subject Papers Count Error:", error);

          papersCount = 0;
        }

        // ==================================================
        // RETURN SUBJECT
        // ==================================================

        return {
          id: subjectId,

          _id: subjectId,

          name: subject.name || "Untitled Subject",

          code: subject.code || "",

          course: subject.course || "",

          year: subject.year || "",

          semester: subject.semester || "",

          description: subject.description || "",

          // REAL UNITS
          units,

          // UNIT COUNTS
          totalUnits,

          completedUnits: validCompletedUnits,

          // REAL SUBJECT PROGRESS
          progress,

          progressPercentage: progress,

          completion: progress,

          resources: {
            notes: notesCount,

            papers: papersCount,

            quizQuestions: quizCount,
          },
        };
      }),
    );

    // ==========================================================
    // OVERALL LEARNING PROGRESS
    //
    // This is based on all subject units.
    // ==========================================================

    const totalUnitsAcrossSubjects = subjectData.reduce(
      (total, subject) => total + Number(subject.totalUnits || 0),
      0,
    );

    const completedUnitsAcrossSubjects = subjectData.reduce(
      (total, subject) => total + Number(subject.completedUnits || 0),
      0,
    );

    const learningProgress =
      totalUnitsAcrossSubjects > 0
        ? Math.round(
            (completedUnitsAcrossSubjects / totalUnitsAcrossSubjects) * 100,
          )
        : 0;

    // ==========================================================
    // PENDING ITEMS
    // ==========================================================

    const pendingItems = [];

    // ==========================================================
    // RECENT NOTES
    // ==========================================================

    let recentNotes = [];

    try {
      recentNotes = await Note.find(noteFilter)
        .populate("subject", "name code")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean();
    } catch (noteError) {
      console.error("Recent Notes Error:", noteError);

      recentNotes = [];
    }

    // ==========================================================
    // QUIZ RESULTS
    //
    // This is ONLY for:
    // - Today's Test
    // - Quiz Performance
    //
    // It does NOT affect Subject Progress.
    // ==========================================================

    let quizResults = [];

    try {
      quizResults = await QuizResult.find({
        user: studentId,
      })
        .sort({
          completedAt: -1,
        })
        .limit(10)
        .lean();
    } catch (quizResultError) {
      console.error("Dashboard Quiz Results Error:", quizResultError);

      quizResults = [];
    }

    // ==========================================================
    // TODAY'S QUIZ RESULT
    //
    // Gets the latest quiz completed today.
    // ==========================================================

    let todayQuizResult = null;

    try {
      todayQuizResult = await QuizResult.findOne({
        user: studentId,

        completedAt: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      })
        .sort({
          completedAt: -1,
        })
        .lean();
    } catch (todayQuizError) {
      console.error("Today's Quiz Result Error:", todayQuizError);

      todayQuizResult = null;
    }

    // ==========================================================
    // TODAY'S TEST SCORE
    // ==========================================================

    const todayTestScore = todayQuizResult
      ? Number(todayQuizResult.percentage)
      : null;

    // ==========================================================
    // QUIZ PERFORMANCE
    //
    // Oldest → newest
    // for dashboard chart.
    // ==========================================================

    const quizPerformance = quizResults
      .slice()
      .reverse()
      .map((result) => ({
        id: result._id,

        subject: result.subject,

        unit: result.unit,

        score: Number(result.score || 0),

        total: Number(result.total || 0),

        percentage: Number(result.percentage || 0),

        completedAt: result.completedAt,
      }));

    // ==========================================================
    // RECENT PAPERS
    // ==========================================================

    let recentPapers = [];

    try {
      recentPapers = await Paper.find(paperFilter)
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean();
    } catch (paperError) {
      console.error("Recent Papers Error:", paperError);

      recentPapers = [];
    }

    // ==========================================================
    // FINAL RESPONSE
    // ==========================================================

    return res.status(200).json({
      success: true,

      // ========================================================
      // STUDENT
      // ========================================================

      student: {
        id: student._id,

        name: student.name,

        email: student.email,

        course: student.course,

        year: student.year,

        semester: student.semester,

        role: student.role,
      },

      // ========================================================
      // STATS
      // ========================================================

      stats: {
        totalSubjects: subjectData.length,

        totalNotes,

        totalPapers,

        totalQuizQuestions,

        totalExams: upcomingExamsLimited.length,

        // ======================================================
        // REAL OVERALL LEARNING PROGRESS
        // ======================================================

        learningProgress,

        // ======================================================
        // DAILY PLANNER
        // ======================================================

        planner: {
          totalTasks: totalPlannerTasks,

          completedTasks: completedPlannerTasks,

          pendingTasks: pendingPlannerTasks,

          completionPercentage: plannerCompletionPercentage,
        },

        // ======================================================
        // REAL TODAY'S TEST SCORE
        //
        // IMPORTANT:
        // This must NOT be null when a quiz was completed today.
        // ======================================================

        todayTestScore,

        // ======================================================
        // QUIZ PERFORMANCE
        // ======================================================

        quizPerformance,

        // ======================================================
        // PENDING ITEMS
        // ======================================================

        pendingItems,

        // ======================================================
        // UPCOMING EXAMS
        // ======================================================

        upcomingExams: upcomingExamsLimited,
      },

      // ========================================================
      // SUBJECTS
      //
      // Dashboard uses dashboardData.subjects
      // ========================================================

      subjects: subjectData,

      // ========================================================
      // EXAMS
      // ========================================================

      exams: upcomingExamsLimited,

      // ========================================================
      // NOTES
      // ========================================================

      recentNotes,

      // ========================================================
      // QUIZ PERFORMANCE
      // ========================================================

      quizPerformance,

      // ========================================================
      // PAPERS
      // ========================================================

      recentPapers,

      // ========================================================
      // DAILY PLANNER
      // ========================================================

      dailyPlanner: {
        date: startOfToday,

        totalTasks: totalPlannerTasks,

        completedTasks: completedPlannerTasks,

        pendingTasks: pendingPlannerTasks,

        completionPercentage: plannerCompletionPercentage,

        tasks: todayPlans,
      },
    });
  } catch (error) {
    console.error("Student Dashboard Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to load student dashboard.",

      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getStudentDashboard,
};
