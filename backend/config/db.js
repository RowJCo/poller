import sqlite3 from 'sqlite3';

const createDb = () => {
    try{
        //create a new database
        let db = new sqlite3.Database('./poller.sqlite', sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the database.');
        });
        db.serialize(() => {
            //create two tables on for users and one for polls each poll has a user_id as a foreign key
            db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
            db.run('CREATE TABLE polls (id INTEGER PRIMARY KEY, question TEXT, user_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id))');
            //create user who will represent all the polls that are not associated with a user
            db.run('INSERT INTO users (username, password) VALUES ("guest", "guest")');
        });
        //close the database connection
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Closed the database connection.');
        });
    } catch (error) {
        console.error(error.message);
    };
};

const connectEditDb = () => {
    //open the database in readwrite mode
    let db = new sqlite3.Database('./poller.sqlite', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
    return db;
};

const connectReadDb = () => {
    //open the database in readonly mode
    let db = new sqlite3.Database('./poller.sqlite', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
    return db;
};

const closeDb = (db) => {
    //close the database connection
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
    });
};


export default { createDb, connectEditDb, connectReadDb, closeDb };