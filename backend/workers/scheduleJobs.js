// Load node modules
import cron from "node-cron";

//Load custom modules
import deleteGuestPolls from "./deleteGuestPolls.js";

//runs workers on a schedule, currently set to start around 5:00 AM but can be changed to any time
const scheduleJobs = () => {
    cron.schedule("00 05 * * *", async () => {
        console.log("Deleting old guest polls");
        deleteGuestPolls();
    });
}

export default scheduleJobs;