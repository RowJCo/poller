//Imports dependencies
const express = require("express");
const router = express.Router();
const { connectReadDb, connectEditDb, closeDb } = require("../database");

//GET request to /poll - renders the createPoll view
router.get("/poll/:id", async (req, res) => {
  //get the poll id from the request parameters
  const pollId = req.params.id;
  //connect to the database
  const db = await connectReadDb();
  //get the poll from the database
  db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, poll) => {
    //if there is an error or the poll does not exist, close the database connection and send a 404 status
    if (err || !poll) {
      closeDb(db);
      return res.status(404).send("Poll not found");
    }
    //if the poll is expired, close the database connection and redirect to the poll results page
    if (poll.expired) {
      closeDb(db);
      return res.redirect("/poll/" + pollId + "/results");
    }
    //if there isnt close the database connection and render the poll view
    closeDb(db);
    res.render("poll", { poll });
  });
});

//GET request to /poll/:id/results - renders the pollResults view
router.get("/poll/:id/results", async (req, res) => {
  //get the poll id from the request
  const pollId = req.params.id;
  //connect to the database
  const db = await connectReadDb();
  //get the poll from the database
  db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, poll) => {
    //if there is an error or the poll does not exist, close the database connection and send a 404 status
    if (err || !poll) {
      closeDb(db);
      return res.status(404).send("Poll not found");
    }
    //if there isnt close the database connection and render the pollResults view
    closeDb(db);
    res.render("pollResults", { poll });
  });
});

module.exports = router;
