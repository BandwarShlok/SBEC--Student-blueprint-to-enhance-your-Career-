const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");
const AdminSettings = require("../models/AdminSettings");

/*
========================================
GET ADMIN SETTINGS
========================================
*/

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

    const admin = await Admin.findOne({
      role: "admin",
      isActive: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      settings: {
        key: settings.key,
        adminName: admin?.name || "SBEC Admin",
        email: admin?.email || "",
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


/*
========================================
UPDATE ADMIN SETTINGS
========================================
*/

const updateSettings = async (req, res) => {
  try {
    const {
      adminName,
      email,
      notifications,
      studentRegistration,
    } = req.body;

    if (!adminName || !email) {
      return res.status(400).json({
        success: false,
        message: "Admin name and email are required.",
      });
    }

    /*
    ------------------------------------
    UPDATE ADMIN ACCOUNT
    ------------------------------------
    */

    const admin = await Admin.findOne({
      role: "admin",
      isActive: true,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    admin.name = adminName;
    admin.email = email;

    await admin.save();

    /*
    ------------------------------------
    UPDATE PLATFORM SETTINGS
    ------------------------------------
    */

    let settings = await AdminSettings.findOne({
      key: "default",
    });

    if (!settings) {
      settings = new AdminSettings({
        key: "default",
      });
    }

    settings.notifications =
      typeof notifications === "boolean"
        ? notifications
        : settings.notifications;

    settings.studentRegistration =
      typeof studentRegistration === "boolean"
        ? studentRegistration
        : settings.studentRegistration;

    await settings.save();

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

    return res.status(500).json({
      success: false,
      message: "Failed to update settings.",
    });
  }
};


/*
========================================
CHANGE ADMIN PASSWORD
========================================
*/

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 6 characters.",
      });
    }

    const admin = await Admin.findOne({
      role: "admin",
      isActive: true,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        admin.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;

    await admin.save();

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


module.exports = {
  getSettings,
  updateSettings,
  changePassword,
};