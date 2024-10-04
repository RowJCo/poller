//Imports dependencies
const express = require("express");
const router = express.Router();
const { connectReadDb, closeDb } = require("../database");
const isAuthenticated = require("../middleware/isAuthenticated");

//GET request to /mypolls - renders the myPolls view
router.get("/mypolls", isAuthenticated, async (req, res) => {
  //connect to the read database
  const db = await connectReadDb();
  //get the user id from the session
  const userId = req.session.userId;
  //get the polls from the database
  db.all(`SELECT * FROM polls WHERE user_id = ?`, [userId], (err, rows) => {
    //if there is an error, close the database and send an error message
    if (err) {
      console.error("Error fetching polls.");
      closeDb(db);
      return res.status(500).send("Error fetching polls");
    }
    //filter the polls into active and expired
    const activePolls = rows.filter((poll) => !poll.expired);
    const expiredPolls = rows.filter((poll) => poll.expired);
    //close the database and render the myPolls view
    closeDb(db);
    res.render("myPolls", { activePolls, expiredPolls });
  });
});

module.exports = router;
