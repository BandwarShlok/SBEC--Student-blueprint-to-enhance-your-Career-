const Paper = require("../models/Paper");
const fs = require("fs");
const path = require("path");

/*
========================================
ADD PAPER
========================================
*/
const addPaper = async (req, res) => {
  try {
    const { subject, year, semester } = req.body;

    // Validate text fields
    if (!subject || !year || !semester) {
      return res.status(400).json({
        success: false,
        message: "Subject, year and semester are required.",
      });
    }

    // Validate PDF
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF paper.",
      });
    }

    const paper = await Paper.create({
      subject: subject.trim(),
      year: Number(year),
      semester: semester.trim(),
      fileName: req.file.originalname,
      fileUrl: `/uploads/papers/${req.file.filename}`,
    });

    return res.status(201).json({
      success: true,
      message: "Paper uploaded successfully.",
      paper,
    });
  } catch (error) {
    console.error("ADD PAPER ERROR:", error);

    // Delete uploaded file if database operation failed
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error("FILE DELETE ERROR:", deleteError.message);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

/*
========================================
GET ALL PAPERS
========================================
*/
const getPapers = async (req, res) => {
  try {
    const papers = await Paper.find().sort({
      year: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      papers,
    });
  } catch (error) {
    console.error("GET PAPERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch papers.",
      error: error.message,
    });
  }
};

/*
========================================
GET SINGLE PAPER
========================================
*/
const getPaperById = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found.",
      });
    }

    return res.status(200).json({
      success: true,
      paper,
    });
  } catch (error) {
    console.error("GET PAPER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch paper.",
      error: error.message,
    });
  }
};

/*
========================================
DELETE PAPER
========================================
*/
const deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found.",
      });
    }

    // Delete physical PDF
    if (paper.fileUrl) {
      const filePath = path.join(
        __dirname,
        "..",
        paper.fileUrl.replace(/^\/+/, "")
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Paper.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Paper deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PAPER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete paper.",
      error: error.message,
    });
  }
};

module.exports = {
  addPaper,
  getPapers,
  getPaperById,
  deletePaper,
};