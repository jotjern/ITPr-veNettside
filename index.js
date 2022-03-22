const PORT = 8080;

const { MongoClient } = require("mongodb");
const express = require("express");
const cookieParser = require("cookie-parser")

const app = express();

const mdb_client = new MongoClient("mongodb://127.0.0.1:27017");
const db = mdb_client.db("ofoten_lokalmat");

/* MIDDLEWARE FRA BIBLIOTEKER */

app.use(express.json({}));
app.use(cookieParser());

/* API ROUTER */
app.use("/api", require("./api")(db));

/* STATISK HTML/CSS/JS */
app.use(express.static(__dirname + "/static"));
app.get("/bruker", (req, res) => res.sendFile(__dirname + "/static/bruker.html"));
app.get("/produkter", (req, res) => res.sendFile(__dirname + "/static/produkter.html"));


app.listen(PORT, () => console.log(`Server startet på port ${PORT}`))
mdb_client.connect().then(() => console.log(`Tilkoblet til database`));
