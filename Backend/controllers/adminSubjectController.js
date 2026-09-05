const mongoose = require("mongoose");
const Subject = require("../models/Subject");

/*
=========================================================
NORMALIZE UNITS
=========================================================
*/

const normalizeUnits = (units) => {
  if (!Array.isArray(units)) {
    return [];
  }

  return units
    .map((unit) => {
      const unitName = String(unit?.name || "").trim();

      if (!unitName) {
        return null;
      }

      const topics = Array.isArray(unit?.topics)
        ? unit.topics
            .map((topic) => ({
              name: String(topic?.name || "").trim(),
            }))
            .filter((topic) => topic.name)
        : [];

      return {
        name: unitName,
        topics,
      };
    })
    .filter(Boolean);
};

/*
=========================================================
GET ALL SUBJECTS
=========================================================
*/

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    console.error("Get Subjects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subjects.",
    });
  }
};

/*
=========================================================
CREATE SUBJECT
=========================================================

POST /api/admin/subjects
=========================================================
*/

const createSubject = async (req, res) => {
  try {
    const { name, code, course, year, semester, description, units } = req.body;

    /*
    -----------------------------------------------------
    VALIDATION
    -----------------------------------------------------
    */

    if (!name || !code || !year || !semester) {
      return res.status(400).json({
        success: false,
        message: "Name, code, year and semester are required.",
      });
    }

    /*
    -----------------------------------------------------
    CHECK DUPLICATE CODE
    -----------------------------------------------------
    */

    const normalizedCode = String(code).trim().toUpperCase();

    const existingSubject = await Subject.findOne({
      code: normalizedCode,
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "A subject with this code already exists.",
      });
    }

    /*
    -----------------------------------------------------
    NORMALIZE UNITS
    -----------------------------------------------------
    */

    const normalizedUnits = normalizeUnits(units);

    /*
    -----------------------------------------------------
    CREATE SUBJECT
    -----------------------------------------------------
    */

    const subject = await Subject.create({
      name: String(name).trim(),

      code: normalizedCode,

      course: String(course || "B.Sc Computer Science").trim(),

      year: String(year).trim(),

      semester: String(semester).trim(),

      description: String(description || "").trim(),

      units: normalizedUnits,

      isActive: true,
    });

    console.log("SUBJECT CREATED:", subject._id);

    console.log("UNITS SAVED:", JSON.stringify(subject.units, null, 2));

    return res.status(201).json({
      success: true,
      message: "Subject created successfully.",
      subject,
    });
  } catch (error) {
    console.error("Create Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create subject.",
    });
  }
};

/*
=========================================================
GET SINGLE SUBJECT
=========================================================
*/

const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID.",
      });
    }

    const subject = await Subject.findById(id).lean();

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    return res.status(200).json({
      success: true,
      subject: {
        ...subject,
        units: Array.isArray(subject.units) ? subject.units : [],
      },
    });
  } catch (error) {
    console.error("Get Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subject.",
    });
  }
};

/*
=========================================================
UPDATE SUBJECT
=========================================================

PUT /api/admin/subjects/:id
=========================================================
*/

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID.",
      });
    }

    const { name, code, course, year, semester, description, units, isActive } =
      req.body;

    /*
    -----------------------------------------------------
    FIND SUBJECT
    -----------------------------------------------------
    */

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    /*
    -----------------------------------------------------
    DUPLICATE CODE CHECK
    -----------------------------------------------------
    */

    const normalizedCode =
      code !== undefined ? String(code).trim().toUpperCase() : subject.code;

    if (normalizedCode !== subject.code) {
      const duplicate = await Subject.findOne({
        code: normalizedCode,
        _id: {
          $ne: id,
        },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "A subject with this code already exists.",
        });
      }
    }

    /*
    -----------------------------------------------------
    UPDATE BASIC DETAILS
    -----------------------------------------------------
    */

    if (name !== undefined) {
      subject.name = String(name).trim();
    }

    if (code !== undefined) {
      subject.code = normalizedCode;
    }

    if (course !== undefined) {
      subject.course = String(course).trim();
    }

    if (year !== undefined) {
      subject.year = String(year).trim();
    }

    if (semester !== undefined) {
      subject.semester = String(semester).trim();
    }

    if (description !== undefined) {
      subject.description = String(description).trim();
    }

    /*
    -----------------------------------------------------
    IMPORTANT:
    SAVE UNITS
    -----------------------------------------------------
    */

    if (units !== undefined) {
      subject.units = normalizeUnits(units);
    }

    if (isActive !== undefined) {
      subject.isActive = Boolean(isActive);
    }

    /*
    -----------------------------------------------------
    SAVE TO MONGODB
    -----------------------------------------------------
    */

    await subject.save();

    console.log("SUBJECT UPDATED:", subject._id);

    console.log("UNITS SAVED:", JSON.stringify(subject.units, null, 2));

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully.",
      subject,
    });
  } catch (error) {
    console.error("Update Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update subject.",
    });
  }
};

/*
=========================================================
DELETE SUBJECT
=========================================================
*/

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID.",
      });
    }

    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Subject Error:", error);

    return res.status(500).json({
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
