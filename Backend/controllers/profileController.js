const User = require("../models/User");

/*
=========================================================
GET MY PROFILE
=========================================================

GET /api/profile
=========================================================
*/

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile: user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load profile.",
    });
  }
};

/*
=========================================================
UPDATE MY PROFILE
=========================================================

PUT /api/profile
=========================================================
*/

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const {
      name,
      phone,
      college,
      course,
      year,
      semester,
      rollNumber,
      studyHours,
      difficulty,
      priority,
      subjects,
    } = req.body;

    /*
    =====================================================
    VALIDATION
    =====================================================
    */

    if (!name || !String(name).trim()) {
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

    /*
    =====================================================
    CLEAN SUBJECTS
    =====================================================
    */

    const cleanSubjects = [
      ...new Set(
        subjects.map((subject) => String(subject).trim()).filter(Boolean),
      ),
    ];

    if (cleanSubjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one valid subject.",
      });
    }

    /*
    =====================================================
    UPDATE USER
    =====================================================
    */

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: String(name).trim(),

        phone: phone !== undefined ? String(phone).trim() : "",

        college: college !== undefined ? String(college).trim() : "",

        course:
          course !== undefined ? String(course).trim() : "BSc Computer Science",

        /*
        IMPORTANT:
        YEAR WAS MISSING BEFORE.
        NOW IT IS SAVED.
        */

        year: year !== undefined ? String(year).trim() : "",

        semester: semester !== undefined ? String(semester).trim() : "",

        rollNumber: rollNumber !== undefined ? String(rollNumber).trim() : "",

        studyHours: studyHours !== undefined ? String(studyHours) : "2",

        difficulty: difficulty !== undefined ? String(difficulty) : "Medium",

        priority:
          priority !== undefined ? String(priority) : "Exam Preparation",

        subjects: cleanSubjects,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select("-password")
      .lean();

    /*
    =====================================================
    USER NOT FOUND
    =====================================================
    */

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /*
    =====================================================
    RESPONSE
    =====================================================
    */

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: user,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    /*
    =====================================================
    MONGOOSE VALIDATION ERROR
    =====================================================
    */

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((item) => item.message);

      return res.status(400).json({
        success: false,
        message: messages.join(", ") || "Invalid profile information.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
