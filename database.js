const sqlite3 = require('sqlite3').verbose();

const createDb = () => {
    //create the database or open it if it already exists
    let db = new sqlite3.Database("./poller.sqlite", sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to the database.");
    });
    //create the users table if it doesn't exist
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password TEXT
        )`);
    });
    console.log("Created the users table.");
    //create the polls table if it doesn't exist
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            yes_votes INTEGER NULL,
            no_votes INTEGER NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            expired BOOLEAN DEFAULT FALSE,
            expired_at TEXT DEFAULT NULL,
            user_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
    });
    //close the database connection
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Closed the database connection.");
    });
}

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

module.exports = { createDb, connectEditDb, connectReadDb, closeDb };