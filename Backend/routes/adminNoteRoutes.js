const express = require("express");

const protectAdmin = require("../middleware/adminAuthMiddleware");

const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/adminNoteController");

const router = express.Router();

/*
=========================================================
GET ALL NOTES
=========================================================
*/

router.get(
  "/",
  protectAdmin,
  getAllNotes
);

/*
=========================================================
CREATE NOTE
=========================================================
*/

router.post(
  "/",
  protectAdmin,
  createNote
);

/*
=========================================================
GET SINGLE NOTE
=========================================================
*/

router.get(
  "/:id",
  protectAdmin,
  getNoteById
);

/*
=========================================================
UPDATE NOTE
=========================================================
*/

router.put(
  "/:id",
  protectAdmin,
  updateNote
);

/*
=========================================================
DELETE NOTE
=========================================================
*/

router.delete(
  "/:id",
  protectAdmin,
  deleteNote
);

module.exports = router;