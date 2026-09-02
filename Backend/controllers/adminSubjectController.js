const Subject = require("../models/Subject");

// GET ALL SUBJECTS

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      subjects,
    });

  } catch (error) {
    console.error(
      "Get Subjects Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects.",
    });
  }
};

// CREATE SUBJECT

const createSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      course,
      year,
      semester,
      description,
    } = req.body;

    if (
      !name ||
      !code ||
      !year ||
      !semester
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, code, year and semester are required.",
      });
    }

    const existingSubject =
      await Subject.findOne({
        code: code.toUpperCase(),
      });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message:
          "A subject with this code already exists.",
      });
    }

    const subject = await Subject.create({
      name,
      code,
      course,
      year,
      semester,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Subject created successfully.",
      subject,
    });

  } catch (error) {
    console.error(
      "Create Subject Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to create subject.",
    });
  }
};

// GET SINGLE SUBJECT

const getSubjectById = async (req, res) => {
  try {
    const subject =
      await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    res.status(200).json({
      success: true,
      subject,
    });

  } catch (error) {
    console.error(
      "Get Subject Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch subject.",
    });
  }
};

// UPDATE SUBJECT

const updateSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      course,
      year,
      semester,
      description,
      isActive,
    } = req.body;

    const subject =
      await Subject.findByIdAndUpdate(
        req.params.id,
        {
          name,
          code,
          course,
          year,
          semester,
          description,
          isActive,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Subject updated successfully.",
      subject,
    });

  } catch (error) {
    console.error(
      "Update Subject Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to update subject.",
    });
  }
};

// DELETE SUBJECT

const deleteSubject = async (req, res) => {
  try {
    const subject =
      await Subject.findByIdAndDelete(
        req.params.id
      );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Subject deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete Subject Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete subject.",
    });
  }
};


module.exports = {
  getAllSubjects,
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject,
};