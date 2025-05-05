const bcrypt = require('bcrypt');

const enteredPassword = "Cache2725"; // The one you're trying to log in with
const storedHashedPassword = "$2b$10$EnRoXEkLbA8n160ou2DcRuz4Q6j0TS/rzcxrfADZXy4nNX6YbHKTW"; // From your database

bcrypt.compare(enteredPassword, storedHashedPassword, (err, result) => {
    if (err) {
        console.error("Error:", err);
    } else {
        console.log(result ? "Password matches!" : "Password does NOT match.");
    }
});