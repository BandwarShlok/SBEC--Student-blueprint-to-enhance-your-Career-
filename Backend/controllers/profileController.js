const User = require("../models/User");

// ========================================
// GET MY PROFILE
// GET /api/profile
// ========================================

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      profile: user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load profile.",
    });
  }
};


// ========================================
// UPDATE MY PROFILE
// PUT /api/profile
// ========================================

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      phone,
      college,
      course,
      semester,
      rollNumber,
      studyHours,
      difficulty,
      priority,
      subjects,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one subject.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        phone: phone || "",
        college: college || "",
        course: course || "",
        semester: semester || "",
        rollNumber: rollNumber || "",
        studyHours: studyHours || "2",
        difficulty: difficulty || "Medium",
        priority: priority || "Exam Preparation",
        subjects,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: user,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};