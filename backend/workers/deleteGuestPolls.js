// Load custom modules
import { connectEditDb, closeDb } from "../config/db.js";

const deleteGuestPolls = () => {
    //connect to the database
    let db = connectEditDb();
    //delete all polls associated with the guest user that were created more than 48 hours ago
    db.run("DELETE FROM polls WHERE user_id IS NULL AND created_on < datetime('now', '-2 days')", (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Polls deleted");
        }
        //close the database
        closeDb(db);
    });
};

export default deleteGuestPolls;