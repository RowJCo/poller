//Imports dependencies
const express = require("express");
const router = express.Router();
const { connectEditDb, closeDb } = require("../database");

//POST request to /vote/:id - votes on a poll
router.post("/vote/:id", async (req, res) => {
  //get the poll id and vote from the request
  const pollId = req.params.id;
  const vote = req.body.vote;
  //connect to the edit database
  const db = await connectEditDb();
  // Validate the vote
  if (vote !== "yes" && vote !== "no") {
    // Fetch the poll data to re-render the form with the error message
    db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, poll) => {
      //if there is an error or the poll is not found, close the database and send a 404 status
      if (err) {
        console.error("Error fetching poll.");
        closeDb(db);
        return res.status(500).send("Error fetching poll.");
      }
      //if the poll is not found, close the database and send a 404 status
      if (!poll) {
        closeDb(db);
        return res.status(404).send("Poll not found.");
      }
      //close the database and render the poll view with an error message
      closeDb(db);
      res.render("poll", {
        poll,
        error: "You must select either 'yes' or 'no'.",
      });
    });
    return;
  }
  //vote on the poll
  db.run(
    `UPDATE polls SET ${vote}_votes = COALESCE(${vote}_votes, 0) + 1 WHERE id = ?`,
    [pollId],
    function (err) {
      //if there is an error, close the database and send an error message
      if (err) {
        console.error("Error voting.");
        closeDb(db);
        return res.status(500).send("Error voting.");
      }
      //close the database and redirect to the poll results page
      closeDb(db);
      res.redirect("/poll/" + pollId + "/results");
    }
  );
});

module.exports = router;
