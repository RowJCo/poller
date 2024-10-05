//Imports dependencies
const express = require("express");
const router = express.Router();
const { connectEditDb, closeDb } = require("../database");
const isAuthenticated = require("../middleware/isAuthenticated");

//POST request to /expirepoll/:id - expires a poll
router.post("/expirepoll/:id", isAuthenticated, async (req, res) => {
  //get the poll id from the request parameters
  const pollId = req.params.id;
  //connect to the database
  const db = await connectEditDb();
  //expire the poll
  db.run(
    "UPDATE polls SET expired = TRUE, expired_at = CURRENT_TIMESTAMP WHERE id = ?",
    [pollId],
    function (err) {
      //if there is an error, close the database connection and send a 500 status
      if (err) {
        console.error("Error expiring poll.");
        closeDb(db);
        return res.status(500).send("Error expiring poll.");
      }
      //if there isnt close the database connection and redirect to the mypolls page
      closeDb(db);
      res.redirect("/mypolls");
    }
  );
});

module.exports = router;
