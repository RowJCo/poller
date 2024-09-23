// Load custom modules
import { connectEditDb, closeDb } from '../config/db.js';

const deleteGuestPolls = (req, res) => {
    //connect to the database
    let db = connectEditDb();
    //delete all polls associated with the guest user that where created more than 48 hours ago
    db.run('DELETE FROM polls WHERE user_id = 1 AND created_on < datetime("now", "-2 days")', (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal server error');
        } else {
            res.status(200).send('Polls deleted');
        }
    });
    //close the database
    closeDb(db);
};

export default deleteGuestPolls;