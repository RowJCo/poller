//Imports dependencies
const express = require("express");
const router = express.Router();
const { connectReadDb, closeDb } = require("../database");
const isAuthenticated = require("../middleware/isAuthenticated");

//GET request to /mypolls - renders the myPolls view
router.get("/mypolls", isAuthenticated, async (req, res) => {
  //connect to the database
  const db = await connectReadDb();
  //get the user id from the session
  const userId = req.session.userId;
  //verify that the user exists in the database
  db.get("SELECT username FROM users WHERE id = ?", [userId], (err, user) => {
    //if there is an error or the user does not exist, redirect to the login page
    if (err || !user) {
      closeDb(db);
      return res.redirect("/login");
    }
    //if there isnt select all the polls from the database where the user id matches the user id from the
    db.all(`SELECT * FROM polls WHERE user_id = ?`, [userId], (err, rows) => {
      //if there is an error, close the database connection and send a 500 status code
      if (err) {
        console.error("Error fetching polls.");
        closeDb(db);
        return res.status(500).send("Error fetching polls");
      }
      //if there isnt close the database connection and render the myPolls view with the active and expired polls
      const activePolls = rows.filter((poll) => !poll.expired);
      const expiredPolls = rows.filter((poll) => poll.expired);
      closeDb(db);
      res.render("myPolls", { activePolls, expiredPolls });
    });
  });
});

module.exports = router;
