//Imports dependencies
const express = require("express");
const router = express.Router();

//GET request to / - renders the index view
router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router;
