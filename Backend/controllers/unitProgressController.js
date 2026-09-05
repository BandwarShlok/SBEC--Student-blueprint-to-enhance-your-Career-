const mongoose = require("mongoose");

const UnitProgress = require("../models/UnitProgress");
const Subject = require("../models/Subject");

/*
=========================================================
GET CURRENT STUDENT'S PROGRESS FOR ONE SUBJECT

GET
/api/student/progress/subject/:subjectId
=========================================================
*/

const getSubjectProgress = async (req, res) => {
  try {
    const userId =
      req.user?._id || req.user?.id;

    const { subjectId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Student authentication required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        subjectId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID.",
      });
    }

    const subject =
      await Subject.findOne({
        _id: subjectId,
        isActive: true,
      }).lean();

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    const progress =
      await UnitProgress.find({
        user: userId,
        subject: subjectId,
        completed: true,
      })
        .sort({
          completedAt: 1,
        })
        .lean();

    const totalUnits =
      Array.isArray(subject.units)
        ? subject.units.length
        : 0;

    const completedUnits =
      progress.length;

    const percentage =
      totalUnits === 0
        ? 0
        : Math.round(
            (completedUnits /
              totalUnits) *
              100
          );

    return res.status(200).json({
      success: true,

      subjectId,

      totalUnits,

      completedUnits,

      percentage,

      progress: progress.map(
        (item) => ({
          _id: item._id,
          unitId: item.unitId,
          unitName: item.unitName,
          completed:
            item.completed,
          completedAt:
            item.completedAt,
        })
      ),
    });
  } catch (error) {
    console.error(
      "GET SUBJECT PROGRESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load subject progress.",
    });
  }
};

/*
=========================================================
GET ALL STUDENT PROGRESS

GET
/api/student/progress
=========================================================
*/

const getAllProgress = async (req, res) => {
  try {
    const userId =
      req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Student authentication required.",
      });
    }

    const progress =
      await UnitProgress.find({
        user: userId,
        completed: true,
      })
        .populate(
          "subject",
          "name code units"
        )
        .sort({
          completedAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error(
      "GET ALL PROGRESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load student progress.",
    });
  }
};

/*
=========================================================
TOGGLE UNIT COMPLETION

PATCH
/api/student/progress/subject/:subjectId/unit/:unitId
=========================================================
*/

const toggleUnitProgress = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?._id || req.user?.id;

    const {
      subjectId,
      unitId,
    } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Student authentication required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        subjectId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID.",
      });
    }

    if (!unitId) {
      return res.status(400).json({
        success: false,
        message: "Unit ID is required.",
      });
    }

    /*
    -----------------------------------------------------
    FIND SUBJECT
    -----------------------------------------------------
    */

    const subject =
      await Subject.findOne({
        _id: subjectId,
        isActive: true,
      }).lean();

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    /*
    -----------------------------------------------------
    FIND UNIT
    -----------------------------------------------------
    */

    const unit =
      (subject.units || []).find(
        (item) =>
          String(
            item._id
          ) === String(unitId)
      );

    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Unit does not belong to this subject.",
      });
    }

    /*
    -----------------------------------------------------
    CHECK EXISTING PROGRESS
    -----------------------------------------------------
    */

    const existing =
      await UnitProgress.findOne({
        user: userId,
        subject: subjectId,
        unitId: String(unitId),
      });

    /*
    -----------------------------------------------------
    IF ALREADY COMPLETED
    → MARK INCOMPLETE
    -----------------------------------------------------
    */

    if (existing) {
      await UnitProgress.deleteOne({
        _id: existing._id,
      });

      return res.status(200).json({
        success: true,
        completed: false,
        message:
          "Unit marked as incomplete.",
      });
    }

    /*
    -----------------------------------------------------
    CREATE COMPLETION
    -----------------------------------------------------
    */

    const progress =
      await UnitProgress.create({
        user: userId,

        subject: subjectId,

        unitId: String(unitId),

        unitName:
          unit.name,

        completed: true,

        completedAt:
          new Date(),
      });

    return res.status(200).json({
      success: true,

      completed: true,

      message:
        "Unit completed successfully.",

      progress,
    });
  } catch (error) {
    console.error(
      "TOGGLE UNIT PROGRESS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update unit progress.",
    });
  }
};

module.exports = {
  getSubjectProgress,
  getAllProgress,
  toggleUnitProgress,
};