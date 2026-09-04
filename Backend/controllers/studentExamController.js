const Exam = require("../models/Exam");

/*
====================================================
GET ALL STUDENT EXAMS
====================================================
Only returns exams belonging to the logged-in student.
*/
const getStudentExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      user: req.user._id,
    }).sort({
      examDate: 1,
    });

    return res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    console.error("GET STUDENT EXAMS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student exams.",
    });
  }
};

/*
====================================================
GET SINGLE STUDENT EXAM
====================================================
Student can only access their own exam.
*/
const getStudentExamById = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

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
    console.error("GET STUDENT EXAM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam.",
    });
  }
};

/*
====================================================
CREATE STUDENT EXAM
====================================================
The exam is automatically linked to the
currently logged-in student.
*/
const createStudentExam = async (req, res) => {
  try {
    const {
      title,
      subject,
      examDate,
      examTime,
      year,
      semester,
      duration,
      examType,
      notes,
    } = req.body;

    if (!title || !subject || !examDate || !year || !semester) {
      return res.status(400).json({
        success: false,
        message: "Title, subject, exam date, year and semester are required.",
      });
    }

    const exam = await Exam.create({
      user: req.user._id,

      title: title.trim(),
      subject: subject.trim(),
      examDate,
      examTime: examTime || "",
      year: Number(year),
      semester: semester.trim(),
      duration: duration ? Number(duration) : 180,
      examType: examType || "University",
      notes: notes ? notes.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Exam added successfully.",
      exam,
    });
  } catch (error) {
    console.error("CREATE STUDENT EXAM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create exam.",
    });
  }
};

/*
====================================================
UPDATE STUDENT EXAM
====================================================
Student can only update their own exam.
*/
const updateStudentExam = async (req, res) => {
  try {
    const {
      title,
      subject,
      examDate,
      examTime,
      year,
      semester,
      duration,
      examType,
      notes,
    } = req.body;

    const exam = await Exam.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    if (title !== undefined) {
      exam.title = title.trim();
    }

    if (subject !== undefined) {
      exam.subject = subject.trim();
    }

    if (examDate !== undefined) {
      exam.examDate = examDate;
    }

    if (examTime !== undefined) {
      exam.examTime = examTime;
    }

    if (year !== undefined) {
      exam.year = Number(year);
    }

    if (semester !== undefined) {
      exam.semester = semester.trim();
    }

    if (duration !== undefined) {
      exam.duration = Number(duration);
    }

    if (examType !== undefined) {
      exam.examType = examType;
    }

    if (notes !== undefined) {
      exam.notes = notes.trim();
    }

    await exam.save();

    return res.status(200).json({
      success: true,
      message: "Exam updated successfully.",
      exam,
    });
  } catch (error) {
    console.error("UPDATE STUDENT EXAM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update exam.",
    });
  }
};

/*
====================================================
DELETE STUDENT EXAM
====================================================
Student can only delete their own exam.
*/
const deleteStudentExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    await exam.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE STUDENT EXAM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete exam.",
    });
  }
};

module.exports = {
  getStudentExams,
  getStudentExamById,
  createStudentExam,
  updateStudentExam,
  deleteStudentExam,
};
