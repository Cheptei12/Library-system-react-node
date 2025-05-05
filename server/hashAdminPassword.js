const bcrypt = require('bcrypt');

const password = "Cache2725"; // Change this to your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
    } else {
        console.log("Hashed Password:", hash);
        // Copy this hash and update it in your database
    }
});