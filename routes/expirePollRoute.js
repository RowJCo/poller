//Imports dependencies
const express = require("express");
const router = express.Router();
const { connectEditDb, closeDb } = require("../database");
const isAuthenticated = require("../middleware/isAuthenticated");

//POST request to /expirepoll/:id - expires a poll
router.post("/expirepoll/:id", isAuthenticated, async (req, res) => {
  //get the poll id from the request
  const pollId = req.params.id;
  //connect to the edit database
  const db = await connectEditDb();
  //update the poll to be expired
  db.run(
    "UPDATE polls SET expired = TRUE, expired_at = CURRENT_TIMESTAMP WHERE id = ?",
    [pollId],
    function (err) {
      //if there is an error, close the database and send an error message
      if (err) {
        console.error("Error expiring poll.");
        closeDb(db);
        return res.status(500).send("Error expiring poll.");
      }
      //close the database and redirect to the mypolls page
      closeDb(db);
      res.redirect("/mypolls");
    }
  );
});

module.exports = router;
