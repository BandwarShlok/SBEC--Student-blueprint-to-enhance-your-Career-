const express = require("express");
const mongoose = require("mongoose");

const Subject = require("../models/Subject");
const Note = require("../models/Note");

const router = express.Router();

/* =========================================================
   GET ALL ACTIVE SUBJECTS

   GET /api/student/subjects
========================================================= */

router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find({
      isActive: true,
    })
      .sort({
        name: 1,
      })
      .lean();

    res.status(200).json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error("Student Subjects Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load subjects.",
    });
  }
});

/* =========================================================
   GET SINGLE SUBJECT

   GET /api/student/subjects/:id

   IMPORTANT:
   This route MUST come after /:id/notes
========================================================= */

router.get("/:id/notes", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID.",
      });
    }

    const subject = await Subject.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    const notes = await Note.find({
      subject: id,
    })
      .populate("subject", "name code")
      .sort({
        createdAt: -1,
      })
      .lean();

    res.status(200).json({
      success: true,
      subject,
      notes,
    });
  } catch (error) {
    console.error("Student Notes Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load notes.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID.",
      });
    }

    const subject = await Subject.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    const notes = await Note.find({
      subject: id,
    })
      .populate("subject", "name code")
      .sort({
        createdAt: -1,
      })
      .lean();

    res.status(200).json({
      success: true,
      subject,
      notes,
    });
  } catch (error) {
    console.error("Student Subject Details Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load subject.",
    });
  }
});

module.exports = router;
