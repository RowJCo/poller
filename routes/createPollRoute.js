//Import dependencies
const express = require("express");
const router = express.Router();
const { connectReadDb, connectEditDb, closeDb } = require("../database");
const isAuthenticated = require("../middleware/isAuthenticated");

//GET request to /createpoll - renders the createPolls view
router.get("/createpoll", isAuthenticated, async (req, res) => {
  res.render("createPolls");
});

//POST request to /createpoll - creates a new poll
router.post("/createpoll", isAuthenticated, async (req, res) => {
  //connect to the edit database
  const db = await connectEditDb();
  //get the question from the request
  const { question } = req.body;
  //get the user id from the session
  const userId = req.session.userId;
  //insert the new poll into the database
  db.run(
    "INSERT INTO polls (question, user_id) VALUES (?, ?)",
    [question, userId],
    (err) => {
      //if there is an error, close the database and send an error message
      if (err) {
        closeDb(db);
        return res.status(500).send("Error creating poll.");
      }
      //close the database and redirect to the mypolls page
      closeDb(db);
      res.redirect("/mypolls");
    }
  );
});

module.exports = router;
