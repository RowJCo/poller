// Imports the environment variables from the .env file if the application is not running in production mode.
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// Imports the node modules
const express = require("express");
const session = require("express-session");
const rateLimiter = require("./middleware/rateLimiter");
const {
  createDb,
  connectEditDb,
  connectReadDb,
  closeDb,
} = require("./database");

// Creates an instance of the Express application and configures it.
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(rateLimiter);

// Routes

// Imports the routes
const indexRoute = require("./routes/indexRoute");
const registerRoute = require("./routes/registerRoute");
const loginRoute = require("./routes/logInRoute");
const logoutRoute = require("./routes/logOutRoute");
const dashboardRoute = require("./routes/dashboardRoute");
const createPollRoute = require("./routes/createPollRoute");
const deletePollRoute = require("./routes/deletePollRoute");
const expirePollRoute = require("./routes/expirePollRoute");
const myPollsRoute = require("./routes/myPollsRoute");
const pollRoute = require("./routes/pollRoute");
const voteRoute = require("./routes/voteRoute");

// Uses the routes
app.use(indexRoute);
app.use(registerRoute);
app.use(loginRoute);
app.use(logoutRoute);
app.use(dashboardRoute);
app.use(createPollRoute);
app.use(deletePollRoute);
app.use(expirePollRoute);
app.use(myPollsRoute);
app.use(pollRoute);
app.use(voteRoute);

app.listen(process.env.PORT, () => {
  createDb();
  console.log("Server is running on", process.env.PORT);
});
