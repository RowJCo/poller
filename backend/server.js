// Load node modules
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

//Load custom modules
import { createDb } from "./config/db.js";
import scheduleJobs from "./workers/scheduleJobs.js";
import rateLimiter from "./middleware/rateLimiter.js";
import checkAuth from "./middleware/checkAuth.js";
import { createUser, deleteUser, authenticateUser, deauthenticateUser } from "./controllers/userController.js";
import { createPoll, getPollsById, getPoll, deletePoll, incrementPollNo, incrementPollYes } from "./controllers/pollController.js";

// Load environment variables from the .env file
dotenv.config();

// Create an Express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);
//app.use(express.static("build"));

// User Routes
app.post("/api/users", createUser);
app.post("/api/users/authenticate", authenticateUser);
app.get("/api/users/deauthenticate", deauthenticateUser);
app.delete("/api/users", checkAuth, deleteUser);

// Poll Routes
app.post("/api/polls", createPoll);
app.get("/api/polls", checkAuth, getPollsById);
app.get("/api/polls/:poll_id", getPoll);
app.delete("/api/polls/:poll_id", checkAuth, deletePoll);
app.put("/api/polls/:poll_id/yes", incrementPollYes);
app.put("/api/polls/:poll_id/no", incrementPollNo);

// Static Routes
//app.get("/*", function(_, res) {
    //res.sendFile(path.join(__dirname, "/build/index.html"), function(err) {
      //if (err) {
        //res.status(500).send(err)
      //}
    //})
//});

// Starts the server
app.listen(process.env.PORT, () => {
    //create the database if it does not exist
    createDb();
    console.log("Server is running on port "+process.env.PORT);
});