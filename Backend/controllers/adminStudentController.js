const User = require("../models/User");

const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get Students Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch students.",
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get Student By ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
};
