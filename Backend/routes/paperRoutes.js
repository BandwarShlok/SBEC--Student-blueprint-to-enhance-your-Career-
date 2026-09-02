const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  addPaper,
  getPapers,
  getPaperById,
  deletePaper,
} = require("../controllers/paperController");

const router = express.Router();

/*
========================================
CREATE UPLOAD DIRECTORY
========================================
*/

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "papers"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/*
========================================
MULTER STORAGE
========================================
*/

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);

    const cleanName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, "_");

    cb(
      null,
      `${Date.now()}-${cleanName}${extension}`
    );
  },
});

/*
========================================
PDF FILTER
========================================
*/

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    extension === ".pdf" &&
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF files are allowed."),
      false
    );
  }
};

/*
========================================
MULTER
========================================
*/

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/*
========================================
ROUTES
========================================
*/

// Add paper
router.post(
  "/",
  upload.single("file"),
  addPaper
);

// Get all papers
router.get(
  "/",
  getPapers
);

// Get single paper
router.get(
  "/:id",
  getPaperById
);

// Delete paper
router.delete(
  "/:id",
  deletePaper
);

module.exports = router;