//Imports dependencies
const express = require("express");
const router = express.Router();

//GET request to /logout - logs out a user
router.get("/logout", (req, res) => {
  //destroy the session and redirect to the index page
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
