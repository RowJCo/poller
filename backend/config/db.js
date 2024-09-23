// Load node modules
import sqlite3 from "sqlite3";

const createDb = () => {
    //create a new database
    let db = new sqlite3.Database("./poller.sqlite", sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to the database.");
    });
    db.serialize(() => {
        //create two tables on for users and one for polls each poll has a user_id as a foreign key
        db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL)");
        db.run("CREATE TABLE IF NOT EXISTS polls (id INTEGER PRIMARY KEY, question TEXT NOT NULL, yes INTEGER NULL, no INTEGER NULL , created_on TEXT NOT NULL DEFAULT CURRENT_DATE, user_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id))");
    });
    //close the database connection
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Closed the database connection.");
    });
};

const connectEditDb = () => {
    //open the database in readwrite mode
    let db = new sqlite3.Database("./poller.sqlite", sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to the database.");
    });
    return db;
};

const connectReadDb = () => {
    //open the database in readonly mode
    let db = new sqlite3.Database("./poller.sqlite", sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to the database.");
    });
    return db;
};

const closeDb = (db) => {
    //close the database connection
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Closed the database connection.");
    });
};


export { createDb, connectEditDb, connectReadDb, closeDb };