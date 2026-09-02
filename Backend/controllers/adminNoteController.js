const Note = require("../models/Note");

// GET ALL NOTES

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate("subject", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get Notes Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
    });
  }
};

// GET SINGLE NOTE

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id).populate(
      "subject",
      "name code"
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Get Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch note",
    });
  }
};

// CREATE NOTE

const createNote = async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      year,
      semester,
      fileUrl,
      fileName,
    } = req.body;

    if (
      !title ||
      !subject ||
      !year ||
      !semester
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, subject, year and semester are required",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      subject,
      description: description
        ? description.trim()
        : "",
      year: year.trim(),
      semester: semester.trim(),
      fileUrl: fileUrl
        ? fileUrl.trim()
        : "",
      fileName: fileName
        ? fileName.trim()
        : "",
      createdBy: req.admin
        ? req.admin._id
        : undefined,
    });

    const populatedNote =
      await Note.findById(note._id).populate(
        "subject",
        "name code"
      );

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note: populatedNote,
    });
  } catch (error) {
    console.error("Create Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create note",
    });
  }
};

// UPDATE NOTE

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      subject,
      description,
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

    if (title !== undefined) {
      note.title = title.trim();
    }

    if (subject !== undefined) {
      note.subject = subject;
    }

    if (description !== undefined) {
      note.description =
        description.trim();
    }

    if (year !== undefined) {
      note.year = year.trim();
    }

    if (semester !== undefined) {
      note.semester =
        semester.trim();
    }

    if (fileUrl !== undefined) {
      note.fileUrl =
        fileUrl.trim();
    }

    if (fileName !== undefined) {
      note.fileName =
        fileName.trim();
    }

    await note.save();

    const updatedNote =
      await Note.findById(id).populate(
        "subject",
        "name code"
      );

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Update Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update note",
    });
  }
};

// DELETE NOTE

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note =
      await Note.findByIdAndDelete(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete Note Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete note",
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