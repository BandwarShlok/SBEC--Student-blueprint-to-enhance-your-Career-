const Note = require("../models/Note");

// =========================================================
// GET ALL NOTES
// =========================================================

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate("subject", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
    });
  }
};

// =========================================================
// GET SINGLE NOTE
// =========================================================

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id).populate("subject", "name code");

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
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
      message: "Failed to fetch note",
    });
  }
};

// =========================================================
// CREATE NOTE
// =========================================================

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

    // Required fields
    if (!title || !subject || !unit || !year || !semester || !content) {
      return res.status(400).json({
        success: false,
        message:
          "Title, subject, unit, year, semester and content are required",
      });
    }

    const note = await Note.create({
      title: title.trim(),

      subject,

      unit: Number(unit),

      description: description ? description.trim() : "",

      content: content.trim(),

      year: year.trim(),

      semester: semester.trim(),

      fileUrl: fileUrl ? fileUrl.trim() : "",

      fileName: fileName ? fileName.trim() : "",

      createdBy: req.admin ? req.admin._id : undefined,
    });

    // Return populated subject information
    const populatedNote = await Note.findById(note._id).populate(
      "subject",
      "name code",
    );

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      note: populatedNote,
    });
  } catch (error) {
    console.error("Create Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create note",
    });
  }
};

// =========================================================
// UPDATE NOTE
// =========================================================

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;

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
        message: "Note not found",
      });
    }

    // Update only fields that were provided
    if (title !== undefined) {
      note.title = title.trim();
    }

    if (subject !== undefined) {
      note.subject = subject;
    }

    if (unit !== undefined) {
      note.unit = Number(unit);
    }

    if (description !== undefined) {
      note.description = description.trim();
    }

    if (content !== undefined) {
      note.content = content.trim();
    }

    if (year !== undefined) {
      note.year = year.trim();
    }

    if (semester !== undefined) {
      note.semester = semester.trim();
    }

    if (fileUrl !== undefined) {
      note.fileUrl = fileUrl.trim();
    }

    if (fileName !== undefined) {
      note.fileName = fileName.trim();
    }

    await note.save();

    // Return populated subject information
    const updatedNote = await Note.findById(id).populate(
      "subject",
      "name code",
    );

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Update Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update note",
    });
  }
};

// =========================================================
// DELETE NOTE
// =========================================================

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findByIdAndDelete(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete note",
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
