const QuizQuestion = require("../models/QuizQuestion");

// ============================================================
// GET QUIZ SUBJECTS
// GET /api/quiz/subjects
// ============================================================
const getQuizSubjects = async (req, res) => {
  try {
    const subjects = await QuizQuestion.distinct("subject");

    const sortedSubjects = subjects
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      subjects: sortedSubjects,
    });
  } catch (error) {
    console.error(
      "GET QUIZ SUBJECTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load quiz subjects.",
    });
  }
};

// ============================================================
// GET QUIZ QUESTIONS
// GET /api/quiz?subject=Artificial%20Intelligence&limit=5
// ============================================================
const getStudentQuiz = async (req, res) => {
  try {
    const { subject } = req.query;

    let limit = parseInt(
      req.query.limit,
      10
    );

    // Default number of questions
    if (
      !Number.isInteger(limit) ||
      limit <= 0
    ) {
      limit = 5;
    }

    // Maximum allowed
    if (limit > 50) {
      limit = 50;
    }

    // ==========================================================
    // FILTER
    // ==========================================================

    const filter = {};

    if (
      subject &&
      subject.trim()
    ) {
      filter.subject = subject.trim();
    }

    // ==========================================================
    // GET RANDOM QUESTIONS
    // ==========================================================

    const questions =
      await QuizQuestion.aggregate([
        {
          $match: filter,
        },

        {
          $sample: {
            size: limit,
          },
        },

        // IMPORTANT:
        // Only INCLUDE fields that the student is allowed
        // to receive.
        //
        // We intentionally do NOT include "answer".
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

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error(
      "GET STUDENT QUIZ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load quiz questions.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ============================================================
// SUBMIT QUIZ
// POST /api/quiz/submit
// ============================================================
const submitStudentQuiz = async (
  req,
  res
) => {
  try {
    const { answers } = req.body;

    // ==========================================================
    // VALIDATE REQUEST
    // ==========================================================

    if (
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quiz answers are required.",
      });
    }

    // ==========================================================
    // EXTRACT QUESTION IDS
    // ==========================================================

    const questionIds = answers
      .map(
        (item) => item.questionId
      )
      .filter(Boolean);

    if (questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No valid question IDs were submitted.",
      });
    }

    // ==========================================================
    // GET ACTUAL QUESTIONS
    // ==========================================================

    const questions =
      await QuizQuestion.find({
        _id: {
          $in: questionIds,
        },
      }).select(
        "_id question subject unit optionA optionB optionC optionD answer"
      );

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message:
          "Quiz questions not found.",
      });
    }

    // ==========================================================
    // QUESTION LOOKUP
    // ==========================================================

    const questionMap =
      new Map();

    questions.forEach(
      (question) => {
        questionMap.set(
          question._id.toString(),
          question
        );
      }
    );

    // ==========================================================
    // EVALUATE ANSWERS
    // ==========================================================

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const results = [];

    answers.forEach((item) => {
      const questionId =
        String(item.questionId);

      const selectedAnswer =
        String(
          item.answer || ""
        ).toUpperCase();

      const question =
        questionMap.get(
          questionId
        );

      if (!question) {
        return;
      }

      const correctAnswer =
        String(
          question.answer
        ).toUpperCase();

      // --------------------------------------------------------
      // UNANSWERED
      // --------------------------------------------------------

      if (!selectedAnswer) {
        unanswered++;
      }

      // --------------------------------------------------------
      // CORRECT
      // --------------------------------------------------------

      else if (
        selectedAnswer ===
        correctAnswer
      ) {
        correct++;
      }

      // --------------------------------------------------------
      // WRONG
      // --------------------------------------------------------

      else {
        wrong++;
      }

      // --------------------------------------------------------
      // RESULT
      // --------------------------------------------------------

      results.push({
        questionId:
          question._id,

        question:
          question.question,

        selectedAnswer:
          selectedAnswer || null,

        correctAnswer,

        isCorrect:
          selectedAnswer ===
          correctAnswer,
      });
    });

    // ==========================================================
    // CALCULATE SCORE
    // ==========================================================

    const total =
      results.length;

    const percentage =
      total > 0
        ? Math.round(
            (correct / total) *
              100
          )
        : 0;

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.status(200).json({
      success: true,

      result: {
        score: correct,
        total,
        correct,
        wrong,
        unanswered,
        percentage,
      },

      results,
    });
  } catch (error) {
    console.error(
      "SUBMIT STUDENT QUIZ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit quiz.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getQuizSubjects,
  getStudentQuiz,
  submitStudentQuiz,
};