const crypto = require("crypto");
const bcrypt = require("bcrypt");
const fs = require("fs");

// Hentet fra: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
function generate_token() {
    return crypto.randomBytes(64).toString("hex");
}

const common_passwords = fs.readFileSync(__dirname + "/10-million-password-list-top-500.txt")
    .toString()
    .split("\n")
    .filter(line => line.length > 0 && !line.startsWith("#"));


module.exports = (db) => {
    function register(username, password) {
        return new Promise((resolve, reject) => {
            const coll = db.collection("users");

            console.log(common_passwords);
            console.log(password);

            if (common_passwords.includes(password)) {
                return reject("Passordet ditt er for lett å gjette!")
            }

            coll.findOne({username: username}).then(user => {
                if (!user) {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) return reject(err)
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) return reject(err)
                            const token = generate_token();

                            coll.insertOne({
                                username, salt, token,
                                password: hash
                            }).then(() => resolve(token));
                        });
                    });

                } else {
                    reject("Brukernavn opptatt!");
                }
            });
        })
    }

    function get_token_user(token) {
        return new Promise(async (resolve, reject) => {
            const coll = db.collection("users");

            coll.findOne({token: token}).then(user => {
                console.log(user);
                resolve(user);
            }, err => reject(err));
        });
    }

    function login(username, password) {
        const invalid_login = "Feil brukernavn eller passord";

        return new Promise((resolve, reject) => {
            const coll = db.collection("users");

            coll.findOne({username: username}).then(user => {
                if (!user) return reject(invalid_login);
                bcrypt.hash(password, user["salt"], (err, hash) => {
                    if (err) return reject("Server error");
                    if (user["password"] === hash) {
                        const token = generate_token();
                        coll.updateOne({username: username}, {"$set": {token}})
                            .then(() => resolve(token), err => reject(err));
                    } else reject(invalid_login);
                });
            }, () => reject(invalid_login))
        })
    }

    return { login, register, get_token_user };
}