const User = require("../models/User");
const Subject = require("../models/Subject");
const UnitProgress = require("../models/UnitProgress");

// =====================================================
// GET ALL STUDENTS
// =====================================================

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

// =====================================================
// GET STUDENT BY ID
// =====================================================

const getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;

    // ---------------------------------------------
    // Get student
    // ---------------------------------------------

    const student = await User.findById(studentId).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // ---------------------------------------------
    // Get active subjects
    // ---------------------------------------------

    const subjects = await Subject.find({
      isActive: { $ne: false },
    }).lean();

    // ---------------------------------------------
    // Get student's completed units
    // ---------------------------------------------

    const progressRecords = await UnitProgress.find({
      user: studentId,
      completed: true,
    }).lean();

    // ---------------------------------------------
    // Create progress for every subject
    // ---------------------------------------------

    const subjectProgress = subjects.map((subject) => {
      const units = Array.isArray(subject.units) ? subject.units : [];

      const totalUnits = units.length;

      // Only count progress records whose unit actually
      // exists inside this subject.
      const completedUnitIds = new Set();

      progressRecords.forEach((record) => {
        if (String(record.subject) === String(subject._id)) {
          const matchingUnit = units.find(
            (unit) => String(unit._id) === String(record.unitId),
          );

          if (matchingUnit) {
            completedUnitIds.add(String(record.unitId));
          }
        }
      });

      const completedUnits = completedUnitIds.size;

      const percentage =
        totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

      return {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        course: subject.course,
        year: subject.year,
        semester: subject.semester,

        totalUnits,
        completedUnits,
        percentage,

        units: units.map((unit) => ({
          _id: unit._id,
          name: unit.name,

          completed: completedUnitIds.has(String(unit._id)),

          topics: Array.isArray(unit.topics) ? unit.topics : [],
        })),
      };
    });

    // ---------------------------------------------
    // Overall learning progress
    // ---------------------------------------------

    let totalUnits = 0;
    let completedUnits = 0;

    subjectProgress.forEach((subject) => {
      totalUnits += subject.totalUnits;
      completedUnits += subject.completedUnits;
    });

    const overallProgress =
      totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

    // ---------------------------------------------
    // Send response
    // ---------------------------------------------

    res.status(200).json({
      success: true,

      student,

      progress: {
        totalSubjects: subjectProgress.length,
        totalUnits,
        completedUnits,
        percentage: overallProgress,

        subjects: subjectProgress,
      },
    });
  } catch (error) {
    console.error("Get Student By ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAllStudents,
  getStudentById,
};
