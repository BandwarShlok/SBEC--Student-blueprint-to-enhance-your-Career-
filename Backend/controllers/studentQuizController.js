const QuizQuestion = require("../models/QuizQuestion");
const QuizResult = require("../models/QuizResult");

// ============================================================
// GET QUIZ SUBJECTS
// GET /api/quiz/subjects
// ============================================================

const getQuizSubjects = async (req, res) => {
  try {
    const subjects = await QuizQuestion.distinct("subject");

    const sortedSubjects = subjects
      .filter(Boolean)
      .map((subject) => String(subject).trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      subjects: sortedSubjects,
    });
  } catch (error) {
    console.error("GET QUIZ SUBJECTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load quiz subjects.",
    });
  }
};

// ============================================================
// GET QUIZ QUESTIONS
//
// GET /api/quiz
// ?subject=Artificial%20Intelligence
// &unit=Unit%201
// &limit=5
// ============================================================

const getStudentQuiz = async (req, res) => {
  try {
    const subject = String(req.query.subject || "").trim();

    const unit = String(req.query.unit || "").trim();

    let limit = parseInt(req.query.limit, 10);

    if (!Number.isInteger(limit) || limit <= 0) {
      limit = 5;
    }

    if (limit > 50) {
      limit = 50;
    }

    // ========================================================
    // SUBJECT IS REQUIRED
    // ========================================================

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    // ========================================================
    // FILTER
    // ========================================================

    const filter = {
      subject,
    };

    // ========================================================
    // UNIT FILTER
    //
    // If unit is supplied:
    // ONLY questions from that unit.
    //
    // If unit is not supplied:
    // all questions from subject.
    // ========================================================

    if (unit) {
      filter.unit = unit;
    }

    // ========================================================
    // RANDOM QUESTIONS
    // ========================================================

    const questions = await QuizQuestion.aggregate([
      {
        $match: filter,
      },

      {
        $sample: {
          size: limit,
        },
      },

      // ======================================================
      // SECURITY
      //
      // Do NOT send correct answer to student.
      // ======================================================

      {
        $project: {
          _id: 1,
          question: 1,
          subject: 1,
          unit: 1,
          optionA: 1,
          optionB: 1,
          optionC: 1,
          optionD: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      count: questions.length,

      subject,

      unit,

      questions,
    });
  } catch (error) {
    console.error("GET STUDENT QUIZ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load quiz questions.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ============================================================
// SUBMIT QUIZ
//
// POST /api/quiz/submit
//
// Body:
//
// {
//   subject: "Artificial Intelligence",
//   unit: "Unit 1",
//   answers: [
//     {
//       questionId: "...",
//       answer: "A"
//     }
//   ]
// }
// ============================================================

const submitStudentQuiz = async (req, res) => {
  try {
    const studentId = req.user?._id || req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required.",
      });
    }

    const subject = String(req.body?.subject || "").trim();

    const unit = String(req.body?.unit || "").trim();

    const answers = req.body?.answers;

    // ========================================================
    // VALIDATE SUBJECT
    // ========================================================

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    // ========================================================
    // VALIDATE UNIT
    // ========================================================

    if (!unit) {
      return res.status(400).json({
        success: false,
        message: "Unit is required.",
      });
    }

    // ========================================================
    // VALIDATE ANSWERS
    // ========================================================

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Quiz answers are required.",
      });
    }

    // ========================================================
    // QUESTION IDS
    // ========================================================

    const questionIds = answers.map((item) => item?.questionId).filter(Boolean);

    if (questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid question IDs were submitted.",
      });
    }

    // ========================================================
    // GET QUESTIONS
    //
    // IMPORTANT:
    // Verify subject AND unit.
    // ========================================================

    const questions = await QuizQuestion.find({
      _id: {
        $in: questionIds,
      },

      subject,

      unit,
    }).select(
      "_id question subject unit optionA optionB optionC optionD answer",
    );

    // ========================================================
    // SECURITY CHECK
    //
    // Every submitted question must belong
    // to selected subject + unit.
    // ========================================================

    if (questions.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz questions for the selected subject and unit.",
      });
    }

    // ========================================================
    // QUESTION MAP
    // ========================================================

    const questionMap = new Map();

    questions.forEach((question) => {
      questionMap.set(String(question._id), question);
    });

    // ========================================================
    // CALCULATE RESULT
    // ========================================================

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const results = [];

    answers.forEach((item) => {
      const questionId = String(item.questionId);

      const selectedAnswer = String(item.answer || "")
        .trim()
        .toUpperCase();

      const question = questionMap.get(questionId);

      if (!question) {
        return;
      }

      const correctAnswer = String(question.answer || "")
        .trim()
        .toUpperCase();

      // ------------------------------------------------------
      // UNANSWERED
      // ------------------------------------------------------

      if (!selectedAnswer) {
        unanswered++;
      }

      // ------------------------------------------------------
      // CORRECT
      // ------------------------------------------------------
      else if (selectedAnswer === correctAnswer) {
        correct++;
      }

      // ------------------------------------------------------
      // WRONG
      // ------------------------------------------------------
      else {
        wrong++;
      }

      // ------------------------------------------------------
      // RESULT DETAIL
      // ------------------------------------------------------

      results.push({
        questionId: question._id,

        question: question.question,

        selectedAnswer: selectedAnswer || null,

        correctAnswer,

        isCorrect: selectedAnswer === correctAnswer,
      });
    });

    // ========================================================
    // TOTAL
    // ========================================================

    const total = questions.length;

    // ========================================================
    // SCORE
    //
    // 1 point per correct answer.
    // ========================================================

    const score = correct;

    // ========================================================
    // PERCENTAGE
    // ========================================================

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    // ========================================================
    // SAVE RESULT TO MONGODB
    // ========================================================

    const savedResult = await QuizResult.create({
      user: studentId,

      subject,

      unit,

      score,

      total,

      correct,

      wrong,

      unanswered,

      percentage,

      completedAt: new Date(),
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message: "Quiz submitted successfully.",

      result: {
        id: savedResult._id,

        subject,

        unit,

        score,

        total,

        correct,

        wrong,

        unanswered,

        percentage,

        completedAt: savedResult.completedAt,

        details: results,
      },
    });
  } catch (error) {
    console.error("SUBMIT STUDENT QUIZ ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to submit quiz.",

      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ============================================================
// GET STUDENT QUIZ RESULTS
//
// GET /api/quiz/results
// ============================================================

const getStudentQuizResults = async (req, res) => {
  try {
    const studentId = req.user?._id || req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required.",
      });
    }

    const results = await QuizResult.find({
      user: studentId,
    })
      .sort({
        completedAt: -1,
      })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,

      count: results.length,

      results,
    });
  } catch (error) {
    console.error("GET QUIZ RESULTS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to load quiz results.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getQuizSubjects,
  getStudentQuiz,
  submitStudentQuiz,
  getStudentQuizResults,
};
