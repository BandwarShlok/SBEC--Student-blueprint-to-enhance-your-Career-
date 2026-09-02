const QuizQuestion = require("../models/QuizQuestion");

// ============================================================
// GET ALL QUESTIONS
// ============================================================

const getQuestions = async (req, res) => {
  try {
    const questions = await QuizQuestion.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error(
      "GET QUIZ QUESTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load quiz questions.",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE QUESTION
// ============================================================

const getQuestionById = async (req, res) => {
  try {
    const question =
      await QuizQuestion.findById(
        req.params.id
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    console.error(
      "GET QUIZ QUESTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load question.",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE QUESTION
// ============================================================

const createQuestion = async (req, res) => {
  try {
    const {
      question,
      subject,
      unit,
      optionA,
      optionB,
      optionC,
      optionD,
      answer,
    } = req.body;

    // Validation
    if (
      !question ||
      !subject ||
      !unit ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD ||
      !answer
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All question fields are required.",
      });
    }

    if (!["A", "B", "C", "D"].includes(answer)) {
      return res.status(400).json({
        success: false,
        message:
          "Answer must be A, B, C or D.",
      });
    }

    const newQuestion =
      await QuizQuestion.create({
        question: question.trim(),
        subject: subject.trim(),
        unit: unit.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        answer,
      });

    return res.status(201).json({
      success: true,
      message:
        "Quiz question created successfully.",
      question: newQuestion,
    });
  } catch (error) {
    console.error(
      "CREATE QUIZ QUESTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create quiz question.",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE QUESTION
// ============================================================

const updateQuestion = async (req, res) => {
  try {
    const {
      question,
      subject,
      unit,
      optionA,
      optionB,
      optionC,
      optionD,
      answer,
    } = req.body;

    if (
      !question ||
      !subject ||
      !unit ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD ||
      !answer
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All question fields are required.",
      });
    }

    if (!["A", "B", "C", "D"].includes(answer)) {
      return res.status(400).json({
        success: false,
        message:
          "Answer must be A, B, C or D.",
      });
    }

    const updatedQuestion =
      await QuizQuestion.findByIdAndUpdate(
        req.params.id,
        {
          question: question.trim(),
          subject: subject.trim(),
          unit: unit.trim(),
          optionA: optionA.trim(),
          optionB: optionB.trim(),
          optionC: optionC.trim(),
          optionD: optionD.trim(),
          answer,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Quiz question updated successfully.",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error(
      "UPDATE QUIZ QUESTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update quiz question.",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE QUESTION
// ============================================================

const deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion =
      await QuizQuestion.findByIdAndDelete(
        req.params.id
      );

    if (!deletedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Quiz question deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE QUIZ QUESTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete quiz question.",
      error: error.message,
    });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};