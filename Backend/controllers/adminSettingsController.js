const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");
const AdminSettings = require("../models/AdminSettings");

// ============================================================
// GET ADMIN SETTINGS
// ============================================================

const getSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({
      key: "default",
    });

    if (!settings) {
      settings = await AdminSettings.create({
        key: "default",
        notifications: true,
        studentRegistration: true,
      });
    }

    // Prefer the authenticated admin.
    // Fall back to an active admin only if req.user
    // does not contain an admin ID.
    const adminId = req.user?._id || req.user?.id;

    let admin = null;

    if (adminId) {
      admin = await Admin.findById(adminId).select("-password");
    }

    if (!admin) {
      admin = await Admin.findOne({
        role: "admin",
        isActive: true,
      }).select("-password");
    }

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    return res.status(200).json({
      success: true,

      settings: {
        key: settings.key,

        adminName: admin.name || "SBEC Admin",

        email: admin.email || "",

        notifications: settings.notifications,

        studentRegistration: settings.studentRegistration,

        _id: settings._id,

        createdAt: settings.createdAt,

        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings.",
    });
  }
};

// ============================================================
// UPDATE ADMIN SETTINGS
// ============================================================

const updateSettings = async (req, res) => {
  try {
    const { adminName, email, notifications, studentRegistration } = req.body;

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    const cleanAdminName = String(adminName || "").trim();

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!cleanAdminName) {
      return res.status(400).json({
        success: false,
        message: "Admin name is required.",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Admin email is required.",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // ----------------------------------------------------------
    // FIND AUTHENTICATED ADMIN
    // ----------------------------------------------------------

    const adminId = req.user?._id || req.user?.id;

    let admin = null;

    if (adminId) {
      admin = await Admin.findById(adminId);
    }

    if (!admin) {
      admin = await Admin.findOne({
        role: "admin",
        isActive: true,
      });
    }

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    // ----------------------------------------------------------
    // CHECK EMAIL DUPLICATE
    // ----------------------------------------------------------

    const existingAdmin = await Admin.findOne({
      email: cleanEmail,
      _id: {
        $ne: admin._id,
      },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "This email is already being used by another admin.",
      });
    }

    // ----------------------------------------------------------
    // UPDATE ADMIN ACCOUNT
    // ----------------------------------------------------------

    admin.name = cleanAdminName;
    admin.email = cleanEmail;

    await admin.save();

    // ----------------------------------------------------------
    // UPDATE PLATFORM SETTINGS
    // ----------------------------------------------------------

    let settings = await AdminSettings.findOne({
      key: "default",
    });

    if (!settings) {
      settings = new AdminSettings({
        key: "default",
      });
    }

    if (typeof notifications === "boolean") {
      settings.notifications = notifications;
    }

    if (typeof studentRegistration === "boolean") {
      settings.studentRegistration = studentRegistration;
    }

    await settings.save();

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "Settings updated successfully.",

      settings: {
        key: settings.key,

        adminName: admin.name,

        email: admin.email,

        notifications: settings.notifications,

        studentRegistration: settings.studentRegistration,

        _id: settings._id,

        createdAt: settings.createdAt,

        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);

    // Duplicate MongoDB unique field
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An admin with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update settings.",
    });
  }
};

// ============================================================
// CHANGE ADMIN PASSWORD
// ============================================================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 6 characters.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    // ----------------------------------------------------------
    // FIND AUTHENTICATED ADMIN
    // ----------------------------------------------------------

    const adminId = req.user?._id || req.user?.id;

    let admin = null;

    if (adminId) {
      admin = await Admin.findById(adminId);
    }

    if (!admin) {
      admin = await Admin.findOne({
        role: "admin",
        isActive: true,
      });
    }

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    // ----------------------------------------------------------
    // CHECK CURRENT PASSWORD
    // ----------------------------------------------------------

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      admin.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // ----------------------------------------------------------
    // HASH NEW PASSWORD
    // ----------------------------------------------------------

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;

    await admin.save();

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getSettings,
  updateSettings,
  changePassword,
};
