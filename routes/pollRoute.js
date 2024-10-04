//Imports dependencies
const express = require("express");
const router = express.Router();
const { connectReadDb, connectEditDb, closeDb } = require("../database");

//GET request to /poll - renders the createPoll view
router.get("/poll/:id", async (req, res) => {
  //get the poll id from the request parameters
  const pollId = req.params.id;
  //connect to the read database
  const db = await connectReadDb();
  //get the poll from the database
  db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, poll) => {
    //if there is an error or the poll is not found, close the database and send a 404 status
    if (err || !poll) {
      closeDb(db);
      return res.status(404).send("Poll not found");
    }
    //if the poll is expired, close the database and redirect to the poll results page
    if (poll.expired) {
      closeDb(db);
      return res.redirect("/poll/" + pollId + "/results");
    }
    //close the database and render the poll view
    closeDb(db);
    res.render("poll", { poll });
  });
});

//GET request to /poll/:id/results - renders the pollResults view
router.get("/poll/:id/results", async (req, res) => {
  //get the poll id from the request parameters
  const pollId = req.params.id;
  //connect to the read database
  const db = await connectReadDb();
  //get the poll from the database
  db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, poll) => {
    //if there is an error or the poll is not found, close the database and send a 404 status
    if (err || !poll) {
      closeDb(db);
      return res.status(404).send("Poll not found");
    }
    //close the database and render the pollResults view
    closeDb(db);
    res.render("pollResults", { poll });
  });
});

module.exports = router;
