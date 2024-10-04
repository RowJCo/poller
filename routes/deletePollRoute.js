//Import dependencies
const express = require("express");
const router = express.Router();
const { connectEditDb, closeDb } = require("../database");
const isAuthenticated = require("../middleware/isAuthenticated");

//POST request to /deletepoll/:id - deletes a poll
router.post("/deletepoll/:id", isAuthenticated, async (req, res) => {
  //get the poll id from the request
  const pollId = req.params.id;
  //connect to the edit database
  const db = await connectEditDb();
  //delete the poll from the database
  db.run("DELETE FROM polls WHERE id = ?", [pollId], function (err) {
    //if there is an error, close the database and send an error message
    if (err) {
      console.error("Error deleting poll.");
      closeDb(db);
      return res.status(500).send("Error deleting poll.");
    }
    //close the database and redirect to the mypolls page
    closeDb(db);
    res.redirect("/mypolls");
  });
});

module.exports = router;
