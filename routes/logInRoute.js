//Imports dependencies
const express = require("express");
const router = express.Router();
const { connectEditDb, closeDb } = require("../database");

//GET request to /login - renders the login view
router.get("/login", (req, res) => {
  res.render("login");
});

//POST request to /login - logs in a user
router.post("/login", async (req, res) => {
  //get username and password from the request body
  const { username, password } = req.body;
  //connect to the edit database
  const db = await connectEditDb();
  //get the user from the database
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    //if there is an error, close the database and render the login view with an error message
    if (err) {
      closeDb(db);
      return res.render("login", {
        error: "An error occurred. Please try again.",
      });
    }
    //if the user is not found or the password is incorrect, close the database and render the login view with an error message
    if (!user || user.password !== password) {
      closeDb(db);
      return res.render("login", { error: "Invalid username or password." });
    }
    //if successful set the user id in the session and close the database
    req.session.userId = user.id;
    closeDb(db);
    res.redirect("/dashboard");
  });
});

module.exports = router;
