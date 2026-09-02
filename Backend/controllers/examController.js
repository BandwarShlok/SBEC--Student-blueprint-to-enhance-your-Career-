const mongoose = require("mongoose");
const Exam = require("../models/Exam");

/*
====================================================
GET ALL EXAMS
GET /api/admin/exams
====================================================
*/

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    console.error("GET EXAMS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exams.",
      error: error.message,
    });
  }
};

/*
====================================================
GET SINGLE EXAM
GET /api/admin/exams/:id
====================================================
*/

const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    return res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    console.error("GET SINGLE EXAM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam.",
      error: error.message,
    });
  }
};

/*
====================================================
CREATE EXAM
POST /api/admin/exams
====================================================
*/

const createExam = async (req, res) => {
  try {
    console.log("====================================");
    console.log("CREATE EXAM REQUEST");
    console.log("BODY:", req.body);
    console.log("====================================");

    const { title, subject, examDate, year, semester, duration, questions } =
      req.body;

    /*
    -----------------------------------------------
    REQUIRED FIELD VALIDATION
    -----------------------------------------------
    */

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Exam title is required.",
      });
    }

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    if (!examDate) {
      return res.status(400).json({
        success: false,
        message: "Exam date is required.",
      });
    }

    if (year === undefined || year === null || year === "") {
      return res.status(400).json({
        success: false,
        message: "Academic year is required.",
      });
    }

    if (!semester || !String(semester).trim()) {
      return res.status(400).json({
        success: false,
        message: "Semester is required.",
      });
    }

    /*
    -----------------------------------------------
    VALIDATE YEAR
    -----------------------------------------------
    */

    const numericYear = Number(year);

    if (Number.isNaN(numericYear)) {
      return res.status(400).json({
        success: false,
        message: "Academic year must be a valid number.",
      });
    }

    /*
    -----------------------------------------------
    VALIDATE DATE
    -----------------------------------------------
    */

    const parsedExamDate = new Date(examDate);

    if (Number.isNaN(parsedExamDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid examination date.",
      });
    }

    /*
    -----------------------------------------------
    DURATION
    -----------------------------------------------
    */

    let numericDuration = 180;

    if (duration !== undefined && duration !== "") {
      numericDuration = Number(duration);

      if (Number.isNaN(numericDuration) || numericDuration <= 0) {
        return res.status(400).json({
          success: false,
          message: "Duration must be a valid positive number.",
        });
      }
    }

    /*
    -----------------------------------------------
    CREATE EXAM
    -----------------------------------------------
    */

    const exam = await Exam.create({
      title: String(title).trim(),

      subject: String(subject).trim(),

      examDate: parsedExamDate,

      year: numericYear,

      semester: String(semester).trim(),

      duration: numericDuration,

      questions: Array.isArray(questions) ? questions : [],
    });

    console.log("EXAM CREATED:", exam._id);

    return res.status(201).json({
      success: true,
      message: "Exam created successfully.",
      exam,
    });
  } catch (error) {
    console.error("====================================");
    console.error("CREATE EXAM ERROR:", error);
    console.error("====================================");

    /*
    -----------------------------------------------
    MONGOOSE VALIDATION ERROR
    -----------------------------------------------
    */

    if (error.name === "ValidationError") {
      const validationMessages = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");

      return res.status(400).json({
        success: false,
        message: validationMessages || "Exam validation failed.",
      });
    }

    /*
    -----------------------------------------------
    GENERAL ERROR
    -----------------------------------------------
    */

    return res.status(500).json({
      success: false,
      message: "Failed to create exam.",
      error: error.message,
    });
  }
};

/*
====================================================
UPDATE EXAM
PUT /api/admin/exams/:id
====================================================
*/

const updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("====================================");
    console.log("UPDATE EXAM");
    console.log("EXAM ID:", id);
    console.log("BODY:", req.body);
    console.log("====================================");

    /*
    -----------------------------------------------
    VALIDATE ID
    -----------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    /*
    -----------------------------------------------
    FIND EXAM
    -----------------------------------------------
    */

    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    const { title, subject, examDate, year, semester, duration, questions } =
      req.body;

    /*
    -----------------------------------------------
    UPDATE TITLE
    -----------------------------------------------
    */

    if (title !== undefined) {
      const cleanTitle = String(title).trim();

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message: "Exam title cannot be empty.",
        });
      }

      exam.title = cleanTitle;
    }

    /*
    -----------------------------------------------
    UPDATE SUBJECT
    -----------------------------------------------
    */

    if (subject !== undefined) {
      const cleanSubject = String(subject).trim();

      if (!cleanSubject) {
        return res.status(400).json({
          success: false,
          message: "Subject cannot be empty.",
        });
      }

      exam.subject = cleanSubject;
    }

    /*
    -----------------------------------------------
    UPDATE EXAM DATE
    -----------------------------------------------
    */

    if (examDate !== undefined) {
      if (!examDate) {
        return res.status(400).json({
          success: false,
          message: "Exam date cannot be empty.",
        });
      }

      const parsedExamDate = new Date(examDate);

      if (Number.isNaN(parsedExamDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid examination date.",
        });
      }

      exam.examDate = parsedExamDate;
    }

    /*
    -----------------------------------------------
    UPDATE YEAR
    -----------------------------------------------
    */

    if (year !== undefined && year !== "") {
      const numericYear = Number(year);

      if (Number.isNaN(numericYear)) {
        return res.status(400).json({
          success: false,
          message: "Year must be a valid number.",
        });
      }

      exam.year = numericYear;
    }

    /*
    -----------------------------------------------
    UPDATE SEMESTER
    -----------------------------------------------
    */

    if (semester !== undefined) {
      const cleanSemester = String(semester).trim();

      if (!cleanSemester) {
        return res.status(400).json({
          success: false,
          message: "Semester cannot be empty.",
        });
      }

      exam.semester = cleanSemester;
    }

    /*
    -----------------------------------------------
    UPDATE DURATION
    -----------------------------------------------
    */

    if (duration !== undefined && duration !== "") {
      const numericDuration = Number(duration);

      if (Number.isNaN(numericDuration) || numericDuration <= 0) {
        return res.status(400).json({
          success: false,
          message: "Duration must be a valid positive number.",
        });
      }

      exam.duration = numericDuration;
    }

    /*
    -----------------------------------------------
    UPDATE QUESTIONS
    -----------------------------------------------
    */

    if (questions !== undefined) {
      exam.questions = Array.isArray(questions) ? questions : [];
    }

    /*
    -----------------------------------------------
    SAVE
    -----------------------------------------------
    */

    const updatedExam = await exam.save();

    console.log("EXAM UPDATED:", updatedExam._id);

    return res.status(200).json({
      success: true,
      message: "Exam updated successfully.",
      exam: updatedExam,
    });
  } catch (error) {
    console.error("====================================");
    console.error("UPDATE EXAM ERROR:", error);
    console.error("====================================");

    if (error.name === "ValidationError") {
      const validationMessages = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");

      return res.status(400).json({
        success: false,
        message: validationMessages || "Exam validation failed.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update exam.",
      error: error.message,
    });
  }
};

/*
====================================================
DELETE EXAM
DELETE /api/admin/exams/:id
====================================================
*/

const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    /*
    -----------------------------------------------
    VALIDATE ID
    -----------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    /*
    -----------------------------------------------
    DELETE
    -----------------------------------------------
    */

    const exam = await Exam.findByIdAndDelete(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    console.log("EXAM DELETED:", id);

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE EXAM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete exam.",
      error: error.message,
    });
  }
};

/*
====================================================
EXPORT CONTROLLERS
====================================================
*/

module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};
