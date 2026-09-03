const User = require("../models/User");
const Subject = require("../models/Subject");
const Note = require("../models/Note");
const Paper = require("../models/Paper");
const QuizQuestion = require("../models/QuizQuestion");
const WeeklyTest = require("../models/WeeklyTest");
const Exam = require("../models/Exam");
const DailyPlan = require("../models/DailyPlan");

const getStudentDashboard = async (req, res) => {
  try {
    // =====================================================
    // CURRENT STUDENT
    // =====================================================

    const studentId = req.user?._id || req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required.",
      });
    }

    const student = await User.findById(studentId).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // =====================================================
    // STUDENT ACADEMIC DETAILS
    // =====================================================

    const studentYear = student.year || "";

    const studentSemester = student.semester || "";

    const studentCourse = student.course || "BSc Computer Science";

    // =====================================================
    // TODAY'S DATE
    // =====================================================

    const today = new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // =====================================================
    // SUBJECTS
    // =====================================================

    const subjectFilter = {
      isActive: true,
    };

    if (studentYear) {
      subjectFilter.year = studentYear;
    }

    if (studentSemester) {
      subjectFilter.semester = studentSemester;
    }

    if (studentCourse) {
      subjectFilter.course = studentCourse;
    }

    const subjects = await Subject.find(subjectFilter)
      .sort({
        name: 1,
      })
      .lean();

    // =====================================================
    // NOTES
    // =====================================================

    const noteFilter = {};

    if (studentYear) {
      noteFilter.year = studentYear;
    }

    if (studentSemester) {
      noteFilter.semester = studentSemester;
    }

    const totalNotes = await Note.countDocuments(noteFilter);

    // =====================================================
    // PREVIOUS PAPERS
    // =====================================================

    const paperFilter = {};

    if (studentYear) {
      paperFilter.year = Number(studentYear) || studentYear;
    }

    if (studentSemester) {
      paperFilter.semester = studentSemester;
    }

    const totalPapers = await Paper.countDocuments(paperFilter);

    // =====================================================
    // QUIZ QUESTIONS
    // =====================================================

    const totalQuizQuestions = await QuizQuestion.countDocuments();

    // =====================================================
    // ACTIVE WEEKLY TESTS
    // =====================================================

    const activeWeeklyTests = await WeeklyTest.find({
      status: "Active",
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    // =====================================================
    // EXAMS
    // =====================================================
    //
    // IMPORTANT:
    // Student Exam Planner exams contain the logged-in
    // student's ID in the "user" field.
    //
    // This prevents one student from seeing another
    // student's personal exams.
    // =====================================================

    const examFilter = {
      user: studentId,
    };

    if (studentYear) {
      examFilter.year = Number(studentYear) || studentYear;
    }

    if (studentSemester) {
      examFilter.semester = studentSemester;
    }

    const exams = await Exam.find(examFilter)
      .sort({
        examDate: 1,
      })
      .lean();

    // =====================================================
    // UPCOMING EXAMS
    // =====================================================

    const upcomingExams = exams.filter((exam) => {
      if (!exam.examDate) {
        return false;
      }

      const examDate = new Date(exam.examDate);

      if (Number.isNaN(examDate.getTime())) {
        return false;
      }

      return examDate >= startOfToday;
    });

    const upcomingExamsLimited = upcomingExams.slice(0, 5);

    // =====================================================
    // TODAY'S DAILY PLANNER
    // =====================================================

    const todayPlans = await DailyPlan.find({
      user: studentId,

      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    })
      .sort({
        startTime: 1,
        createdAt: 1,
      })
      .lean();

    // =====================================================
    // TOTAL TASKS FOR TODAY
    // =====================================================

    const totalPlannerTasks = todayPlans.length;

    // =====================================================
    // COMPLETED TASKS FOR TODAY
    // =====================================================

    const completedPlannerTasks = todayPlans.filter(
      (plan) => plan.completed === true,
    ).length;

    // =====================================================
    // PENDING TASKS FOR TODAY
    // =====================================================

    const pendingPlannerTasks = totalPlannerTasks - completedPlannerTasks;

    // =====================================================
    // PLANNER COMPLETION PERCENTAGE
    // =====================================================

    const plannerCompletionPercentage =
      totalPlannerTasks > 0
        ? Math.round((completedPlannerTasks / totalPlannerTasks) * 100)
        : 0;

    // =====================================================
    // PLANNER PENDING ITEMS
    // =====================================================

    const pendingItems = todayPlans
      .filter((plan) => plan.completed !== true)
      .map((plan) => ({
        id: plan._id,

        title: plan.title,

        description: plan.description || "",

        date: plan.date,

        startTime: plan.startTime || "",

        endTime: plan.endTime || "",

        priority: plan.priority || "Medium",

        category: plan.category || "Study",

        type: "daily-planner",

        completed: false,
      }));

    // =====================================================
    // RECENT NOTES
    // =====================================================

    const recentNotes = await Note.find(noteFilter)
      .populate("subject", "name code")
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    // =====================================================
    // RECENT PAPERS
    // =====================================================

    const recentPapers = await Paper.find(paperFilter)
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    // =====================================================
    // SUBJECT DATA
    // =====================================================

    const subjectData = await Promise.all(
      subjects.map(async (subject) => {
        const subjectId = subject._id;

        // =================================================
        // SUBJECT NOTES
        // =================================================

        const notesCount = await Note.countDocuments({
          subject: subjectId,
        });

        // =================================================
        // SUBJECT QUIZ QUESTIONS
        // =================================================

        const quizCount = await QuizQuestion.countDocuments({
          subject: subject.name,
        });

        // =================================================
        // SUBJECT PAPERS
        // =================================================

        const papersCount = await Paper.countDocuments({
          subject: subject.name,
        });

        // =================================================
        // SUBJECT WEEKLY TESTS
        // =================================================

        const weeklyTestsCount = await WeeklyTest.countDocuments({
          subject: subject.name,

          status: "Active",
        });

        // =================================================
        // LEARNING PROGRESS
        // =================================================
        //
        // If your Subject model contains any of these:
        //
        // progress
        // progressPercentage
        // completion
        //
        // we use that value.
        //
        // If none exists, we use 0 instead of returning
        // null. This prevents the Dashboard from showing
        // a dash.
        // =================================================

        const rawProgress =
          subject.progress ?? subject.progressPercentage ?? subject.completion;

        const numericProgress = Number(rawProgress);

        const progress = Number.isFinite(numericProgress)
          ? Math.min(100, Math.max(0, numericProgress))
          : 0;

        return {
          id: subject._id,

          name: subject.name,

          code: subject.code,

          course: subject.course,

          year: subject.year,

          semester: subject.semester,

          description: subject.description || "",

          resources: {
            notes: notesCount,

            papers: papersCount,

            quizQuestions: quizCount,

            activeWeeklyTests: weeklyTestsCount,
          },

          progress,
        };
      }),
    );

    // =====================================================
    // OVERALL LEARNING PROGRESS
    // =====================================================
    //
    // Calculates the average progress of all active
    // subjects belonging to this student's course/year/
    // semester.
    //
    // Example:
    //
    // AI       = 80%
    // Networks = 60%
    // SE       = 70%
    // IoT      = 50%
    //
    // Overall = 65%
    // =====================================================

    const learningProgress =
      subjectData.length > 0
        ? Math.round(
            subjectData.reduce(
              (total, subject) => total + (Number(subject.progress) || 0),
              0,
            ) / subjectData.length,
          )
        : 0;

    // =====================================================
    // DASHBOARD RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      // ===================================================
      // STUDENT
      // ===================================================

      student: {
        id: student._id,

        name: student.name,

        email: student.email,

        course: student.course,

        year: student.year,

        semester: student.semester,

        role: student.role,
      },

      // ===================================================
      // STATS
      // ===================================================

      stats: {
        // =================================================
        // GENERAL STATS
        // =================================================

        totalSubjects: subjects.length,

        totalNotes,

        totalPapers,

        totalQuizQuestions,

        activeWeeklyTests: activeWeeklyTests.length,

        totalExams: upcomingExamsLimited.length,

        // =================================================
        // DAILY PLANNER STATS
        // =================================================

        planner: {
          totalTasks: totalPlannerTasks,

          completedTasks: completedPlannerTasks,

          pendingTasks: pendingPlannerTasks,

          completionPercentage: plannerCompletionPercentage,
        },

        // =================================================
        // TODAY'S TEST
        // =================================================
        //
        // There is currently no student test-attempt/result
        // model in this controller.
        //
        // Therefore we DO NOT create a fake score.
        //
        // Dashboard will correctly show:
        //
        // —
        //
        // until test-result tracking is implemented.
        // =================================================

        todayTestScore: null,

        // =================================================
        // LEARNING PROGRESS
        // =================================================

        learningProgress,

        // =================================================
        // PENDING ITEMS
        // =================================================

        pendingItems,

        // =================================================
        // UPCOMING EXAMS
        // =================================================

        upcomingExams: upcomingExamsLimited,
      },

      // ===================================================
      // SUBJECTS
      // ===================================================

      subjects: subjectData,

      // ===================================================
      // WEEKLY TESTS
      // ===================================================

      weeklyTests: activeWeeklyTests,

      // ===================================================
      // EXAMS
      // ===================================================

      exams: upcomingExamsLimited,

      // ===================================================
      // RECENT NOTES
      // ===================================================

      recentNotes,

      // ===================================================
      // RECENT PAPERS
      // ===================================================

      recentPapers,

      // ===================================================
      // TODAY'S PLANNER
      // ===================================================

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

module.exports = {
  getStudentDashboard,
};
