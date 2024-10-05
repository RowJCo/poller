//Imports dependencies
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { connectEditDb, closeDb } = require("../database");

//GET request to /login - renders the login view
router.get("/login", (req, res) => {
  res.render("login");
});

//POST request to /login - logs in a user
router.post("/login", async (req, res) => {
  //get the username and password from the request body
  const { username, password } = req.body;
  //connect to the database
  const db = await connectEditDb();
  //get the user from the database
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    //if there is an error or the user does not exist, close the database connection and render the login view with an error message
    if (err) {
      closeDb(db);
      return res.render("login", {
        error: "An error occurred. Please try again.",
      });
    }
    //compare the password with the hashed password
    if (!user || !bcrypt.compareSync(password, user.password)) {
      closeDb(db);
      return res.render("login", { error: "Invalid username or password." });
    }
    //if the password is correct, set the user id in the session and close the database connection
    req.session.userId = user.id;
    closeDb(db);
    res.redirect("/dashboard");
  });
});

module.exports = router;
