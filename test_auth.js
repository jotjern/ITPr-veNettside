const authentication = require("./api/authentication");
const { MongoClient } = require("mongodb");
const assert = require("assert");

function random_username() {
    return `TestUser ${Math.floor(Math.random() * 100000)}`;
}

function random_password() {
    return Math.floor((Math.random() * 0xffffffff) + 0xffffff).toString(16);
}

const mdb_client = new MongoClient("mongodb://127.0.0.1:27017");
mdb_client.connect().then(async () => {
    const db = mdb_client.db("ofoten_lokalmat");
    const users = db.collection("users");
    const auth = authentication(db);

    console.log(`${random_username()}@${random_password()}`)

    await users.deleteMany({"username": {"$regex": "^TestUser"}});

    let [username, password] = [random_username(), random_password()];

    try {
        await auth.login(username, password)
        console.error("Failed test: Logged in to non-existing user")
    } catch (e) {  }

    try {
        await auth.register(username, password)
    } catch (e) { console.error("Failed test: Could not register user") }

    try {
        await auth.register(username, password)
        console.error("Failed test: Registered same username twice")
    } catch (e) {  }

    try {
        await auth.login(username, password)
    } catch (e) { console.error(`Failed test: Could not log in to registered user: ${e}`) }

    await users.deleteMany({"username": {"$regex": "^TestUser"}});

});
