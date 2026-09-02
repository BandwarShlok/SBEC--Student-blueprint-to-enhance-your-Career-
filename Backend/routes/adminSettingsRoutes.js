const express = require("express");

const {
  getSettings,
  updateSettings,
  changePassword,
} = require("../controllers/adminSettingsController");

const router = express.Router();

/*
========================================
GET SETTINGS
========================================
*/

router.get("/", getSettings);


/*
========================================
UPDATE SETTINGS
========================================
*/

router.put("/", updateSettings);


/*
========================================
CHANGE PASSWORD
========================================
*/

router.put("/password", changePassword);

module.exports = router;