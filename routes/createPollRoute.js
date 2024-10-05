//Import dependencies
const express = require("express");
const router = express.Router();
const { connectReadDb, connectEditDb, closeDb } = require("../database");
const isAuthenticated = require("../middleware/isAuthenticated");

//GET request to /createpoll - renders the createPolls view
router.get("/createpoll", isAuthenticated, async (req, res) => {
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
    //if there isnt close the database connection and render the createPolls view
    closeDb(db);
    res.render("createPolls");
  });
});

//POST request to /createpoll - creates a new poll
router.post("/createpoll", isAuthenticated, async (req, res) => {
  //connect to the database
  const db = await connectEditDb();
  //get the question from the request body and the user id from the session
  const { question } = req.body;
  const userId = req.session.userId;
  //insert the new poll into the database
  db.run(
    "INSERT INTO polls (question, user_id) VALUES (?, ?)",
    [question, userId],
    (err) => {
      //if there is an error, close the database connection and send a 500 status code
      if (err) {
        closeDb(db);
        return res.status(500).send("Error creating poll.");
      }
      //if there isnt close the database connection and redirect to the mypolls page
      closeDb(db);
      res.redirect("/mypolls");
    }
  );
});

module.exports = router;
