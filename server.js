if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const session = require("express-session");
const RateLimit = require('express-rate-limit');
const bcrypt = require("bcrypt");
const { createDb, connectEditDb, connectReadDb, closeDb } = require("./database");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

const limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per windowMs
});
  
app.use(limiter);

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const db = await connectEditDb();

    // Check if the username already exists
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            closeDb(db);
            return res.render('register', { error: "An error occurred. Please try again." });
        }

        if (user) {
            closeDb(db);
            return res.render('register', { error: "Username already exists. Please choose another one." });
        }

        // Insert the new user into the database
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err) => {
            if (err) {
                closeDb(db);
                return res.render('register', { error: "An error occurred. Please try again." });
            }

            closeDb(db);
            res.redirect('/login');
        });
    });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const db = await connectEditDb();

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            closeDb(db);
            return res.render('login', { error: "An error occurred. Please try again." });
        }

        if (!user || user.password !== password) {
            closeDb(db);
            return res.render('login', { error: "Invalid username or password." });
        }

        req.session.userId = user.id;
        closeDb(db);
        res.redirect('/dashboard');
    });
});

app.get("/dashboard", isAuthenticated, async (req, res) => {
    const db = await connectReadDb();
    const userId = req.session.userId;
    db.get("SELECT username FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            closeDb(db);
            return res.redirect("/login");
        }
        closeDb(db);
        res.render("dashboard", { username: user.username });
    });
});

app.get('/mypolls', isAuthenticated, async (req, res) => {
    const db = await connectReadDb();
    const userId = req.session.userId;
    db.get("SELECT username FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            closeDb(db);
            return res.redirect("/login");
        }
        db.all(`SELECT * FROM polls WHERE user_id = ?`, [userId], (err, rows) => {
            if (err) {
                console.error(err.message);
                closeDb(db);
                return res.status(500).send("Error fetching polls");
            }
            const activePolls = rows.filter(poll => !poll.expired);
            const expiredPolls = rows.filter(poll => poll.expired);
            closeDb(db);
            res.render('viewPolls', { activePolls, expiredPolls });
        });
    });
    
});

app.get("/createpoll", isAuthenticated, async (req, res) => {
    const db = await connectReadDb();
    const userId = req.session.userId;
    db.get("SELECT username FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            closeDb(db);
            return res.redirect("/login");
        }
        closeDb(db);
        res.render("createPolls");
    });
});

app.post("/createpoll", isAuthenticated, async (req, res) => {
    const db = await connectEditDb();
    const { question } = req.body;
    const userId = req.session.userId;
    db.run("INSERT INTO polls (question, user_id) VALUES (?, ?)", [question, userId], (err) => {
        if (err) {
            closeDb(db);
            return res.status(500).send("Error creating poll: " + err.message);
        }
        closeDb(db);
        res.redirect("/mypolls");
    });
});

app.post('/expirepoll/:id', isAuthenticated, async (req, res) => {
    const pollId = req.params.id;
    const db = await connectEditDb();
    db.run("UPDATE polls SET expired = TRUE, expired_at = CURRENT_TIMESTAMP WHERE id = ?", [pollId], function(err) {
        if (err) {
            console.error(err.message);
            closeDb(db);
            return res.status(500).send("Error expiring poll: " + err.message);
        }
        closeDb(db);
        res.redirect('/mypolls');
    });
});

app.post("/deletepoll/:id", isAuthenticated, async (req, res) => {
    const pollId = req.params.id;
    const db = await connectEditDb();
    db.run("DELETE FROM polls WHERE id = ?", [pollId], function(err) {
        if (err) {
            console.error(err.message);
            closeDb(db);
            return res.status(500).send("Error deleting poll: " + err.message);
        }
        closeDb(db);
        res.redirect('/mypolls');
    });
});

app.get("/poll/:id", async (req, res) => {
    const pollId = req.params.id;
    const db = await connectReadDb();
    db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, poll) => {
        if (err || !poll) {
            closeDb(db);
            return res.status(404).send("Poll not found");
        }
        if (poll.expired) {
            closeDb(db);
            return res.redirect("/poll/" + pollId + "/results");
        }
        closeDb(db);
        res.render("poll", { poll });
    });
});

app.get("/poll/:id/results", async (req, res) => {
    const pollId = req.params.id;
    const db = await connectReadDb();
    db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, poll) => {
        if (err || !poll) {
            closeDb(db);
            return res.status(404).send("Poll not found");
        }
        closeDb(db);
        res.render("pollResults", { poll });
    });
});

app.post("/vote/:id", async (req, res) => {
    const pollId = req.params.id;
    const vote = req.body.vote;
    const db = await connectEditDb();
    // Validate the vote
    if (vote !== "yes" && vote !== "no") {
        // Fetch the poll data to re-render the form with the error message
        db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, poll) => {
            if (err) {
                console.error(err.message);
                closeDb(db);
                return res.status(500).send("Error fetching poll: " + err.message);
            }
            closeDb(db);
            res.render("poll", { poll, error: "You must select either 'yes' or 'no'." });
        });
        return;
    }
    db.run(`UPDATE polls SET ${vote}_votes = COALESCE(${vote}_votes, 0) + 1 WHERE id = ?`, [pollId], function(err) {
        if (err) {
            console.error(err.message);
            closeDb(db);
            return res.status(500).send("Error voting: " + err.message);
        }
        closeDb(db);
        res.redirect("/poll/" + pollId + "/results");
    });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(process.env.PORT, () => {
    createDb();
    console.log("Server is running on", process.env.PORT);
});