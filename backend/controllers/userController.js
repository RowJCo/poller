//Load node modules
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Load custom modules
import { connectEditDb, closeDb } from "../config/db.js";

const createUser = (req, res) => {
    //connect to the database
    let db = connectEditDb();
    //get the username and password from the request
    let { username, password } = req.body;
    //hash the password
    hashedPassword = bcrypt.hashSync(password, 10);
    //check if the username is taken
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(400).send("Failed to create user");
        } else if (row) {
            res.status(400).send("Username is already taken");
        }
    });
    //create a new user
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
        if (err) {
            console.error(err.message);
            res.status(400).send("Failed to create user");
        } else {
            res.status(200).send("User created");
        }
    });
    //close the database
    closeDb(db);
};

const deleteUser = (req, res) => {
    //connect to the database
    let db = connectEditDb();
    //get the user id from the request
    let { user_id } = req;
    //delete the user
    db.run("DELETE FROM users WHERE id = ?", [user_id], (err) => {
        if (err) {
            console.error(err.message);
            res.status(400).send("Failed to delete user");
        } else {
            res.status(200).send("User deleted");
        }
    });
};

const authenticateUser = (req, res) => {
    //connect to the database
    let db = connectReadDb();
    //get the username and password from the request
    let { username, password } = req.body;
    //get the user from the database
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(400).send("Failed to authenticate user");
        } else if (row) {
            //compare the password
            if (bcrypt.compareSync(password, row.password)) {
                //create a token
                let token = jwt.sign({ user_id: row.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
                res.cookie("Authorization", token, { 
                    httpOnly: true,
                    path: "/",
                    secure: true,
                    sameSite: "Strict",
                });
                res.status(200).send("User authenticated");
            } else {
                res.status(400).send("Invalid password");
            }
        } else {
            res.status(400).send("User not found");
        }
    });
    //close the database
    closeDb(db);
};

const deauthenticateUser = (req, res) => {
    try {
        res.clearCookie("Authorization");
        res.status(200).send("User deauthenticated");
    } catch (error) {
        console.error(error.message);
        res.status(400).send("Failed to deauthenticate user");
    }
};

export { createUser, deleteUser, authenticateUser, deauthenticateUser };