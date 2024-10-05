//Imports dependencies
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { connectEditDb, closeDb } = require("../database");

//GET request to /register - renders the register view
router.get("/register", (req, res) => {
  res.render("register");
});

//POST request to /register - registers a new user
router.post("/register", async (req, res) => {
  //get the username and password from the request body
  const { username, password } = req.body;
  //connect to the database
  const db = await connectEditDb();
  //hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  // Check if the username already exists
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    //if there is an error, close the database connection and render the register view with an error message
    if (err) {
      closeDb(db);
      return res.render("register", {
        error: "An error occurred. Please try again.",
      });
    }
    //if the user already exists, close the database connection and render the register view with an error message
    if (user) {
      closeDb(db);
      return res.render("register", {
        error: "Username already exists. Please choose another one.",
      });
    }
    // Insert the new user into the database
    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      (err) => {
        //if there is an error, close the database connection and render the register view with an error message
        if (err) {
          closeDb(db);
          return res.render("register", {
            error: "An error occurred. Please try again.",
          });
        }
        //if there isnt close the database connection and redirect to the login page
        closeDb(db);
        res.redirect("/login");
      }
    );
  });
});

module.exports = router;
