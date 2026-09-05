const bcrypt = require("bcryptjs");

const User = require("../models/User");
const StudentSettings = require("../models/StudentSettings");

// ============================================================
// GET STUDENT SETTINGS
// GET /api/student/settings
// ============================================================

const getStudentSettings = async (req, res) => {
  try {
    const studentId = req.user?._id || req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required.",
      });
    }

    let settings = await StudentSettings.findOne({
      user: studentId,
    }).lean();

    // Create default settings automatically
    // if the student does not have a settings document yet.
    if (!settings) {
      settings = await StudentSettings.create({
        user: studentId,
      });

      settings = settings.toObject();
    }

    return res.status(200).json({
      success: true,
      settings: {
        notifications: {
          email: Boolean(settings.notifications?.email),
          examReminders: Boolean(
            settings.notifications?.examReminders
          ),
          quizResults: Boolean(
            settings.notifications?.quizResults
          ),
        },

        appearance: {
          theme: settings.appearance?.theme || "dark",
        },
      },
    });
  } catch (error) {
    console.error(
      "GET STUDENT SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load student settings.",
    });
  }
};

// ============================================================
// UPDATE STUDENT SETTINGS
// PUT /api/student/settings
// ============================================================

const updateStudentSettings = async (req, res) => {
  try {
    const studentId = req.user?._id || req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required.",
      });
    }

    const {
      notifications,
      appearance,
    } = req.body;

    const updateData = {};

    // --------------------------------------------------------
    // NOTIFICATIONS
    // --------------------------------------------------------

    if (notifications) {
      if (
        typeof notifications.email === "boolean"
      ) {
        updateData["notifications.email"] =
          notifications.email;
      }

      if (
        typeof notifications.examReminders ===
        "boolean"
      ) {
        updateData["notifications.examReminders"] =
          notifications.examReminders;
      }

      if (
        typeof notifications.quizResults ===
        "boolean"
      ) {
        updateData["notifications.quizResults"] =
          notifications.quizResults;
      }
    }

    // --------------------------------------------------------
    // APPEARANCE
    // --------------------------------------------------------

    if (appearance?.theme) {
      const allowedThemes = [
        "light",
        "dark",
        "system",
      ];

      if (
        !allowedThemes.includes(
          appearance.theme
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid theme selected.",
        });
      }

      updateData["appearance.theme"] =
        appearance.theme;
    }

    const settings =
      await StudentSettings.findOneAndUpdate(
        {
          user: studentId,
        },
        {
          $set: updateData,
          $setOnInsert: {
            user: studentId,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      ).lean();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      settings: {
        notifications: {
          email: Boolean(
            settings.notifications?.email
          ),

          examReminders: Boolean(
            settings.notifications
              ?.examReminders
          ),

          quizResults: Boolean(
            settings.notifications
              ?.quizResults
          ),
        },

        appearance: {
          theme:
            settings.appearance?.theme ||
            "dark",
        },
      },
    });
  } catch (error) {
    console.error(
      "UPDATE STUDENT SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update student settings.",
    });
  }
};

// ============================================================
// CHANGE STUDENT PASSWORD
// PUT /api/student/settings/password
// ============================================================

const changeStudentPassword = async (
  req,
  res
) => {
  try {
    const studentId = req.user?._id || req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required.",
      });
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new password and confirm password are required.",
      });
    }

    // --------------------------------------------------------
    // PASSWORD LENGTH
    // --------------------------------------------------------

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 6 characters.",
      });
    }

    // --------------------------------------------------------
    // CONFIRM PASSWORD
    // --------------------------------------------------------

    if (
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match.",
      });
    }

    // --------------------------------------------------------
    // FIND STUDENT
    // --------------------------------------------------------

    const user = await User.findById(
      studentId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // --------------------------------------------------------
    // CHECK CURRENT PASSWORD
    // --------------------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    // --------------------------------------------------------
    // PREVENT SAME PASSWORD
    // --------------------------------------------------------

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from your current password.",
      });
    }

    // --------------------------------------------------------
    // HASH NEW PASSWORD
    // --------------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "CHANGE STUDENT PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to change password.",
    });
  }
};

module.exports = {
  getStudentSettings,
  updateStudentSettings,
  changeStudentPassword,
};