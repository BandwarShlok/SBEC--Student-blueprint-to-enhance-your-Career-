const express = require("express");
const mongoose = require("mongoose");

const Subject = require("../models/Subject");
const Note = require("../models/Note");

const router = express.Router();

/*
=========================================================
GET ALL ACTIVE SUBJECTS

GET /api/student/subjects
=========================================================
*/

router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find({
      isActive: true,
    })
      .sort({
        name: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error("Student Subjects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load subjects.",
    });
  }
});

/*
=========================================================
GET NOTES FOR SUBJECT

GET /api/student/subjects/:id/notes
=========================================================
*/

router.get("/:id/notes", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID.",
      });
    }

    /*
    -----------------------------------------------------
    FIND SUBJECT
    -----------------------------------------------------
    */

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

    /*
    -----------------------------------------------------
    FIND NOTES
    -----------------------------------------------------

    IMPORTANT:
    Note.subject is an ObjectId reference to Subject.
    Therefore we search using the subject ObjectId.
    -----------------------------------------------------
    */

    const notes = await Note.find({
      subject: new mongoose.Types.ObjectId(id),
    })
      .populate("subject", "name code year semester")
      .sort({
        createdAt: -1,
      })
      .lean();

    console.log(
      `Student Notes: ${notes.length} notes found for subject ${subject.name}`,
    );

    /*
    -----------------------------------------------------
    RESPONSE
    -----------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      subject: {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        course: subject.course,
        year: subject.year,
        semester: subject.semester,
        description: subject.description || "",
        units: subject.units || [],
      },

      notes,
    });
  } catch (error) {
    console.error("Student Subject Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load notes.",
    });
  }
});

/*
=========================================================
GET SINGLE SUBJECT

GET /api/student/subjects/:id
=========================================================
*/

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
      subject: new mongoose.Types.ObjectId(id),
    })
      .populate("subject", "name code year semester")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,

      subject: {
        ...subject,
        units: subject.units || [],
      },

      notes,
    });
  } catch (error) {
    console.error("Student Subject Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load subject.",
    });
  }
});

module.exports = router;
