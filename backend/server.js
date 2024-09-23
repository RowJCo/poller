// Load node modules
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

//Load custom modules
import { createDb } from "./config/db.js";

// Load environment variables from the .env file
dotenv.config();

// Create an Express app
const app = express();
app.use(express.json());

app.listen(process.env.PORT, () => {
    //create the database if it does not exist
    createDb();
    console.log("Server is running on port"+process.env.PORT);
});