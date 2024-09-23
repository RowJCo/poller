// Load custom modules
import { connectEditDb, connectReadDb, closeDb } from "../config/db.js";

const createPoll = (req, res) => {
    console.log("creating poll");
    //connect to the database
    let db = connectEditDb();
    //get the poll data from the request
    let { question} = req.body;
    //get the user id from the request
    let { user_id } = req;
    //create a new poll
    db.run("INSERT INTO polls (question, user_id) VALUES (?, ?)", [question, user_id], (err) => {
        if (err) {
            console.error(err.message);
            res.status(400).send("Failed to create poll");
        } else {
            res.status(200).send("Poll created");
        }
    });
    //close the database
    closeDb(db);
};

const deletePoll = (req, res) => {
    console.log("deleting poll");
    //connect to the database
    let db = connectEditDb();
    //get the poll id from the request
    let { poll_id } = req;
    //delete the poll
    db.run("DELETE FROM polls WHERE id = ?", [poll_id], (err) => {
        if (err) {
            console.error(err.message);
            res.status(400).send("Failed to delete poll");
        } else {
            res.status(200).send("Poll deleted");
        }
    });
};

const incrementPollYes = (req, res) => {
    console.log("incrementing yes");
    //connect to the database
    let db = connectEditDb();
    //get the poll id from the request
    let { poll_id } = req.params;
    //get the poll
    db.get("SELECT * FROM polls WHERE id = ?", [poll_id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(400).send("Failed to get poll");
            closeDb(db); // Close the database connection on error
        } else if (!row) {
            // Check if the row is undefined
            res.status(404).send("Poll not found");
            closeDb(db); // Close the database connection if poll not found
        } else {
            //increment the poll
            //convert the old yes value to a number
            let oldYes = Number(row.yes);
            let yes = oldYes + 1;
            db.run("UPDATE polls SET yes = ? WHERE id = ?", [yes, poll_id], (err) => {
                if (err) {
                    console.error(err.message);
                    res.status(400).send("Failed to increment poll");
                } else {
                    res.status(200).send("Poll incremented");
                }
                closeDb(db); // Close the database connection after the update query completes
            });
        }
    });
};

const incrementPollNo = (req, res) => {
    console.log("incrementing no");
    //connect to the database
    let db = connectEditDb();
    //get the poll id from the request
    let { poll_id } = req.params;
    //get the poll
    db.get("SELECT * FROM polls WHERE id = ?", [poll_id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(400).send("Failed to get poll");
            closeDb(db); // Close the database connection on error
        } else if (!row) {
            // Check if the row is undefined
            res.status(404).send("Poll not found");
            closeDb(db); // Close the database connection if poll not found
        } else {
            //increment the poll
            let no = row.no + 1;
            db.run("UPDATE polls SET no = ? WHERE id = ?", [no, poll_id], (err) => {
                if (err) {
                    console.error(err.message);
                    res.status(400).send("Failed to increment poll");
                } else {
                    res.status(200).send("Poll incremented");
                }
                closeDb(db); // Close the database connection after the update query completes
            });
        }
    });
};

const getPollsById = (req, res) => {
    console.log("getting polls by user_id");
    //connect to the database
    let db = connectReadDb();
    //get the user id from the request
    let { user_id } = req;
    //get the polls
    db.all("SELECT * FROM polls WHERE user_id = ?", [user_id], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(400).send("Failed to get polls");
        } else {
            res.status(200).send(rows);
        }
    });
    //close the database
    closeDb(db);
};

const getPoll = (req, res) => {
    console.log("getting poll by poll_id");
    //connect to the database
    let db = connectReadDb();
    //get the poll id from the request
    let { poll_id } = req.params; // Corrected to extract poll_id from req.params
    //get the poll
    db.get("SELECT * FROM polls WHERE id = ?", [poll_id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(400).send("Failed to get poll");
        } else {
            res.status(200).send(row);
        }
        //close the database
        closeDb(db);
    });
};

export { createPoll, deletePoll, getPollsById, getPoll, incrementPollYes, incrementPollNo };