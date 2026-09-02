const express = require("express");

const WeeklyTest = require("../models/WeeklyTest");

const router = express.Router();

/*
==================================================
GET ALL WEEKLY TESTS
GET /api/admin/weekly-tests
==================================================
*/

router.get("/", async (req, res) => {
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
});

/*
==================================================
GET SINGLE WEEKLY TEST
GET /api/admin/weekly-tests/:id
==================================================
*/

router.get("/:id", async (req, res) => {
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
      "GET SINGLE WEEKLY TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch weekly test.",
    });
  }
});

/*
==================================================
CREATE WEEKLY TEST
POST /api/admin/weekly-tests
==================================================
*/

router.post("/", async (req, res) => {
  try {
    const {
      title,
      subject,
      week,
      questions,
      duration,
      status,
    } = req.body;

    if (
      !title ||
      !subject ||
      !week ||
      !questions ||
      !duration
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, subject, week, questions and duration are required.",
      });
    }

    const newTest = await WeeklyTest.create({
      title: title.trim(),
      subject: subject.trim(),
      week: week.trim(),
      questions: Number(questions),
      duration: Number(duration),
      status: status || "Draft",
    });

    return res.status(201).json({
      success: true,
      message: "Weekly test created successfully.",
      test: newTest,
    });
  } catch (error) {
    console.error(
      "CREATE WEEKLY TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create weekly test.",
      error: error.message,
    });
  }
});

/*
==================================================
UPDATE WEEKLY TEST
PUT /api/admin/weekly-tests/:id
==================================================
*/

router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      subject,
      week,
      questions,
      duration,
      status,
    } = req.body;

    const test = await WeeklyTest.findById(
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

    if (week !== undefined) {
      test.week = week.trim();
    }

    if (questions !== undefined) {
      test.questions = Number(questions);
    }

    if (duration !== undefined) {
      test.duration = Number(duration);
    }

    if (status !== undefined) {
      test.status = status;
    }

    await test.save();

    return res.status(200).json({
      success: true,
      message: "Weekly test updated successfully.",
      test,
    });
  } catch (error) {
    console.error(
      "UPDATE WEEKLY TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update weekly test.",
    });
  }
});

/*
==================================================
DELETE WEEKLY TEST
DELETE /api/admin/weekly-tests/:id
==================================================
*/

router.delete("/:id", async (req, res) => {
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

    await WeeklyTest.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Weekly test deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE WEEKLY TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete weekly test.",
    });
  }
});

module.exports = router;