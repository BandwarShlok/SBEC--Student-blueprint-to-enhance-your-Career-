const mongoose = require("mongoose");
const Note = require("../models/Note");
const Subject = require("../models/Subject");

/*
=========================================================
GET ALL NOTES
=========================================================
GET /api/admin/notes
=========================================================
*/

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate("subject", "name code year semester units")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes.",
    });
  }
};

/*
=========================================================
GET SINGLE NOTE
=========================================================
GET /api/admin/notes/:id
=========================================================
*/

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findById(id)
      .populate("subject", "name code year semester units")
      .lean();

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Get Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch note.",
    });
  }
};

/*
=========================================================
CREATE NOTE
=========================================================
POST /api/admin/notes
=========================================================
*/

const createNote = async (req, res) => {
  try {
    const {
      title,
      subject,
      unit,
      description,
      content,
      year,
      semester,
      fileUrl,
      fileName,
    } = req.body;

    // -----------------------------------------------
    // BASIC VALIDATION
    // -----------------------------------------------

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note title is required.",
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID.",
      });
    }

    if (!unit?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Unit is required.",
      });
    }

    if (!year?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Year is required.",
      });
    }

    if (!semester?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Semester is required.",
      });
    }

    // Require actual text content or a file
    if (!content?.trim() && !fileUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter note content.",
      });
    }

    // -----------------------------------------------
    // CHECK SUBJECT
    // -----------------------------------------------

    const selectedSubject = await Subject.findById(subject).lean();

    if (!selectedSubject) {
      return res.status(404).json({
        success: false,
        message: "Selected subject not found.",
      });
    }

    // -----------------------------------------------
    // CHECK UNIT
    // -----------------------------------------------

    const selectedUnit = Array.isArray(selectedSubject.units)
      ? selectedSubject.units.find(
          (item) =>
            String(item._id) === String(unit) ||
            String(item.id) === String(unit),
        )
      : null;

    if (!selectedUnit) {
      return res.status(400).json({
        success: false,
        message: "Selected unit does not belong to this subject.",
      });
    }

    // -----------------------------------------------
    // CREATE NOTE
    // -----------------------------------------------

    const note = await Note.create({
      title: title.trim(),

      subject: selectedSubject._id,

      unit: String(selectedUnit._id),

      description: description ? description.trim() : "",

      content: content ? content.trim() : "",

      year: year.trim(),

      semester: semester.trim(),

      fileUrl: fileUrl ? fileUrl.trim() : "",

      fileName: fileName ? fileName.trim() : "",

      createdBy: req.admin ? req.admin._id : undefined,
    });

    // -----------------------------------------------
    // POPULATE
    // -----------------------------------------------

    const populatedNote = await Note.findById(note._id)
      .populate("subject", "name code year semester units")
      .lean();

    console.log("======================================");
    console.log("NOTE CREATED");
    console.log("ID:", populatedNote._id);
    console.log("TITLE:", populatedNote.title);
    console.log("SUBJECT:", populatedNote.subject?.name);
    console.log("UNIT:", populatedNote.unit);
    console.log("CONTENT LENGTH:", populatedNote.content?.length || 0);
    console.log("======================================");

    return res.status(201).json({
      success: true,
      message: "Note created successfully.",
      note: populatedNote,
    });
  } catch (error) {
    console.error("Create Note Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create note.",
    });
  }
};

/*
=========================================================
UPDATE NOTE
=========================================================
PUT /api/admin/notes/:id
=========================================================
*/

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const {
      title,
      subject,
      unit,
      description,
      content,
      year,
      semester,
      fileUrl,
      fileName,
    } = req.body;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    // -----------------------------------------------
    // UPDATE SUBJECT + UNIT
    // -----------------------------------------------

    if (subject !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(subject)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subject ID.",
        });
      }

      const selectedSubject = await Subject.findById(subject).lean();

      if (!selectedSubject) {
        return res.status(404).json({
          success: false,
          message: "Selected subject not found.",
        });
      }

      note.subject = selectedSubject._id;

      if (unit !== undefined) {
        const selectedUnit = Array.isArray(selectedSubject.units)
          ? selectedSubject.units.find(
              (item) =>
                String(item._id) === String(unit) ||
                String(item.id) === String(unit),
            )
          : null;

        if (!selectedUnit) {
          return res.status(400).json({
            success: false,
            message: "Selected unit does not belong to this subject.",
          });
        }

        note.unit = String(selectedUnit._id);
      }
    } else if (unit !== undefined) {
      const selectedSubject = await Subject.findById(note.subject).lean();

      const selectedUnit = Array.isArray(selectedSubject?.units)
        ? selectedSubject.units.find(
            (item) =>
              String(item._id) === String(unit) ||
              String(item.id) === String(unit),
          )
        : null;

      if (!selectedUnit) {
        return res.status(400).json({
          success: false,
          message: "Selected unit does not belong to this subject.",
        });
      }

      note.unit = String(selectedUnit._id);
    }

    // -----------------------------------------------
    // UPDATE OTHER FIELDS
    // -----------------------------------------------

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: "Note title is required.",
        });
      }

      note.title = String(title).trim();
    }

    if (description !== undefined) {
      note.description = String(description).trim();
    }

    if (content !== undefined) {
      note.content = String(content).trim();
    }

    if (year !== undefined) {
      note.year = String(year).trim();
    }

    if (semester !== undefined) {
      note.semester = String(semester).trim();
    }

    if (fileUrl !== undefined) {
      note.fileUrl = String(fileUrl).trim();
    }

    if (fileName !== undefined) {
      note.fileName = String(fileName).trim();
    }

    // -----------------------------------------------
    // CONTENT VALIDATION
    // -----------------------------------------------

    if (!note.content?.trim() && !note.fileUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content cannot be empty.",
      });
    }

    await note.save();

    // -----------------------------------------------
    // POPULATE UPDATED NOTE
    // -----------------------------------------------

    const updatedNote = await Note.findById(note._id)
      .populate("subject", "name code year semester units")
      .lean();

    console.log("NOTE UPDATED:", updatedNote._id);
    console.log("NOTE UNIT:", updatedNote.unit);

    return res.status(200).json({
      success: true,
      message: "Note updated successfully.",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Update Note Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update note.",
    });
  }
};

/*
=========================================================
DELETE NOTE
=========================================================
DELETE /api/admin/notes/:id
=========================================================
*/

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findByIdAndDelete(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete note.",
    });
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
