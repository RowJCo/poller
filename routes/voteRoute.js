//Imports dependencies
const express = require("express");
const router = express.Router();
const { connectEditDb, closeDb } = require("../database");

//POST request to /vote/:id - votes on a poll
router.post("/vote/:id", async (req, res) => {
  //get the poll id and vote from the request parameters
  const pollId = req.params.id;
  const vote = req.body.vote;
  //connect to the database
  const db = await connectEditDb();
  // validate the vote
  if (vote !== "yes" && vote !== "no") {
    // fetch the poll data to re-render the form with the error message
    db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, poll) => {
      // if there is an error, close the database connection and send a 500 status code
      if (err) {
        console.error("Error fetching poll.");
        closeDb(db);
        return res.status(500).send("Error fetching poll.");
      }
      // if an invalid vote was submitted, re-render the poll view with an error message
      closeDb(db);
      res.render("poll", {
        poll,
        error: "You must select either 'yes' or 'no'.",
      });
    });
    return;
  }
  // add the vote to the poll
  db.run(
    `UPDATE polls SET ${vote}_votes = COALESCE(${vote}_votes, 0) + 1 WHERE id = ?`,
    [pollId],
    function (err) {
      // if there is an error, close the database connection and send a 500 status code
      if (err) {
        console.error("Error voting.");
        closeDb(db);
        return res.status(500).send("Error voting.");
      }
      // if there isn't, close the database connection and redirect to the poll results
      closeDb(db);
      res.redirect("/poll/" + pollId + "/results");
    }
  );
});

module.exports = router;
