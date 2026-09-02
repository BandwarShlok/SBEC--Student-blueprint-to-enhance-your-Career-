const WeeklyTest = require("../models/WeeklyTest");

/*
========================================
GET ALL WEEKLY TESTS
========================================
*/

const getWeeklyTests = async (req, res) => {
  try {
    const tests = await WeeklyTest.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tests.length,
      tests,
    });
  } catch (error) {
    console.error(
      "GET WEEKLY TESTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch weekly tests.",
    });
  }
};


/*
========================================
GET SINGLE WEEKLY TEST
========================================
*/

const getWeeklyTestById = async (req, res) => {
  try {
    const test = await WeeklyTest.findById(
      req.params.id
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Weekly test not found.",
      });
    }

    return res.status(200).json({
      success: true,
      test,
    });
  } catch (error) {
    console.error(
      "GET WEEKLY TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch weekly test.",
    });
  }
};


/*
========================================
CREATE WEEKLY TEST
========================================
*/

const createWeeklyTest = async (req, res) => {
  try {
    const {
      title,
      subject,
      unit,
      duration,
      totalMarks,
      questions,
      status,
      testDate,
    } = req.body;

    if (
      !title ||
      !subject ||
      !unit ||
      duration === undefined ||
      totalMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, subject, unit, duration and total marks are required.",
      });
    }

    let parsedQuestions = [];

    if (questions !== undefined) {
      if (!Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          message:
            "Questions must be an array.",
        });
      }

      parsedQuestions = questions;
    }

    const newTest = await WeeklyTest.create({
      title: title.trim(),
      subject: subject.trim(),
      unit: unit.trim(),
      duration: Number(duration),
      totalMarks: Number(totalMarks),
      questions: parsedQuestions,
      status:
        status === "Published"
          ? "Published"
          : "Draft",
      testDate:
        testDate || null,
    });

    return res.status(201).json({
      success: true,
      message:
        "Weekly test created successfully.",
      test: newTest,
    });
  } catch (error) {
    console.error(
      "CREATE WEEKLY TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create weekly test.",
    });
  }
};


/*
========================================
UPDATE WEEKLY TEST
========================================
*/

const updateWeeklyTest = async (req, res) => {
  try {
    const {
      title,
      subject,
      unit,
      duration,
      totalMarks,
      questions,
      status,
      testDate,
    } = req.body;

    const test =
      await WeeklyTest.findById(
        req.params.id
      );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Weekly test not found.",
      });
    }

    if (title !== undefined) {
      test.title = title.trim();
    }

    if (subject !== undefined) {
      test.subject = subject.trim();
    }

    if (unit !== undefined) {
      test.unit = unit.trim();
    }

    if (duration !== undefined) {
      test.duration = Number(duration);
    }

    if (totalMarks !== undefined) {
      test.totalMarks = Number(totalMarks);
    }

    if (questions !== undefined) {
      if (!Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          message:
            "Questions must be an array.",
        });
      }

      test.questions = questions;
    }

    if (status !== undefined) {
      if (
        !["Draft", "Published"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Status must be Draft or Published.",
        });
      }

      test.status = status;
    }

    if (testDate !== undefined) {
      test.testDate = testDate || null;
    }

    const updatedTest =
      await test.save();

    return res.status(200).json({
      success: true,
      message:
        "Weekly test updated successfully.",
      test: updatedTest,
    });
  } catch (error) {
    console.error(
      "UPDATE WEEKLY TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update weekly test.",
    });
  }
};


/*
========================================
DELETE WEEKLY TEST
========================================
*/

const deleteWeeklyTest = async (req, res) => {
  try {
    const test =
      await WeeklyTest.findByIdAndDelete(
        req.params.id
      );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Weekly test not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Weekly test deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE WEEKLY TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete weekly test.",
    });
  }
};


/*
========================================
ADD QUESTION TO TEST
========================================
*/

const addQuestion = async (req, res) => {
  try {
    const {
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      answer,
    } = req.body;

    if (
      !question ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD ||
      !answer
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question, all options and answer are required.",
      });
    }

    if (
      !["A", "B", "C", "D"].includes(
        answer
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Answer must be A, B, C or D.",
      });
    }

    const test =
      await WeeklyTest.findById(
        req.params.id
      );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Weekly test not found.",
      });
    }

    test.questions.push({
      question: question.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: optionC.trim(),
      optionD: optionD.trim(),
      answer,
    });

    await test.save();

    return res.status(200).json({
      success: true,
      message:
        "Question added successfully.",
      test,
    });
  } catch (error) {
    console.error(
      "ADD QUESTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to add question.",
    });
  }
};


/*
========================================
DELETE QUESTION
========================================
*/

const deleteQuestion = async (req, res) => {
  try {
    const test =
      await WeeklyTest.findById(
        req.params.id
      );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Weekly test not found.",
      });
    }

    const question =
      test.questions.id(
        req.params.questionId
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    question.deleteOne();

    await test.save();

    return res.status(200).json({
      success: true,
      message:
        "Question deleted successfully.",
      test,
    });
  } catch (error) {
    console.error(
      "DELETE QUESTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete question.",
    });
  }
};


module.exports = {
  getWeeklyTests,
  getWeeklyTestById,
  createWeeklyTest,
  updateWeeklyTest,
  deleteWeeklyTest,
  addQuestion,
  deleteQuestion,
};