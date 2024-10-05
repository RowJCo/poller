//Import dependencies
const express = require("express");
const router = express.Router();
const { connectReadDb, closeDb } = require("../database");
const isAuthenticated = require("../middleware/isAuthenticated");

//GET request to /dashboard - renders the dashboard view
router.get("/dashboard", isAuthenticated, async (req, res) => {
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
    //if there isnt close the database connection and render the dashboard view
    closeDb(db);
    res.render("dashboard", { username: user.username });
  });
});

module.exports = router;
