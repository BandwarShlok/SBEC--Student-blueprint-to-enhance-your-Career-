const express = require("express");

const protectAdmin = require("../middleware/adminAuthMiddleware");

// Dashboard
const {
  getAdminDashboard,
} = require("../controllers/adminDashboardController");

// Students
const {
  getAllStudents,
  getStudentById,
} = require("../controllers/adminStudentController");

// Subjects
const {
  getAllSubjects,
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controllers/adminSubjectController");

const router = express.Router();

/* ADMIN TEST */

router.get("/test", protectAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Admin API is protected and working.",
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
    },
  });
});

/* ADMIN DASHBOARD */

router.get(
  "/dashboard",
  protectAdmin,
  getAdminDashboard
);

/* STUDENT MANAGEMENT */

// Get all students
router.get(
  "/students",
  protectAdmin,
  getAllStudents
);

// Get single student
router.get(
  "/students/:id",
  protectAdmin,
  getStudentById
);

/* SUBJECT MANAGEMENT */

// Get all subjects
router.get(
  "/subjects",
  protectAdmin,
  getAllSubjects
);

// Create subject
router.post(
  "/subjects",
  protectAdmin,
  createSubject
);

// Get single subject
router.get(
  "/subjects/:id",
  protectAdmin,
  getSubjectById
);

// Update subject
router.put(
  "/subjects/:id",
  protectAdmin,
  updateSubject
);

// Delete subject
router.delete(
  "/subjects/:id",
  protectAdmin,
  deleteSubject
);

/* EXPORT ROUTER */

module.exports = router;