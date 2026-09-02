const User = require("../models/User");
const Subject = require("../models/Subject");
const Note = require("../models/Note");
const Paper = require("../models/Paper");
const QuizQuestion = require("../models/QuizQuestion");
const WeeklyTest = require("../models/WeeklyTest");
const Exam = require("../models/Exam");

const getStudentDashboard = async (req, res) => {
  try {
    // =====================================================
    // CURRENT STUDENT
    // =====================================================

    const studentId =
      req.user?._id || req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required.",
      });
    }

    const student = await User.findById(studentId)
      .select("-password");

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
    const studentCourse =
      student.course || "BSc Computer Science";

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

    const subjects = await Subject.find(
      subjectFilter
    )
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

    const totalNotes =
      await Note.countDocuments(noteFilter);

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

    const totalPapers =
      await Paper.countDocuments(paperFilter);

    // =====================================================
    // QUIZ QUESTIONS
    // =====================================================

    const totalQuizQuestions =
      await QuizQuestion.countDocuments();

    // =====================================================
    // ACTIVE WEEKLY TESTS
    // =====================================================

    const activeWeeklyTests =
      await WeeklyTest.find({
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

    const examFilter = {};

    if (studentYear) {
      examFilter.year =
        Number(studentYear) || studentYear;
    }

    if (studentSemester) {
      examFilter.semester = studentSemester;
    }

    const exams = await Exam.find(
      examFilter
    )
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    // =====================================================
    // RECENT NOTES
    // =====================================================

    const recentNotes =
      await Note.find(noteFilter)
        .populate(
          "subject",
          "name code"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean();

    // =====================================================
    // RECENT PAPERS
    // =====================================================

    const recentPapers =
      await Paper.find(paperFilter)
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
        const subjectId =
          subject._id;

        const notesCount =
          await Note.countDocuments({
            subject: subjectId,
          });

        const quizCount =
          await QuizQuestion.countDocuments({
            subject: subject.name,
          });

        const papersCount =
          await Paper.countDocuments({
            subject: subject.name,
          });

        const weeklyTestsCount =
          await WeeklyTest.countDocuments({
            subject: subject.name,
            status: "Active",
          });

        return {
          id: subject._id,
          name: subject.name,
          code: subject.code,

          course: subject.course,
          year: subject.year,
          semester: subject.semester,

          description:
            subject.description || "",

          resources: {
            notes: notesCount,
            papers: papersCount,
            quizQuestions: quizCount,
            activeWeeklyTests:
              weeklyTestsCount,
          },

          // Progress cannot be calculated yet
          // because there is currently no
          // student progress model.
          progress: null,
        };
      })
    );

    // =====================================================
    // DASHBOARD RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        course: student.course,
        year: student.year,
        semester: student.semester,
        role: student.role,
      },

      stats: {
        totalSubjects:
          subjects.length,

        totalNotes,

        totalPapers,

        totalQuizQuestions,

        activeWeeklyTests:
          activeWeeklyTests.length,

        totalExams:
          exams.length,

        // These are not available
        // in the current database design.
        todayTestScore: null,
        learningProgress: null,
        pendingItems: null,
        upcomingExams: null,
      },

      subjects: subjectData,

      weeklyTests:
        activeWeeklyTests,

      exams,

      recentNotes,

      recentPapers,
    });

  } catch (error) {
    console.error(
      "Student Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load student dashboard.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  getStudentDashboard,
};