const express = require("express");
const cookieParser = require('cookie-parser')

const test_produkt = {"navn": "...", "pris": {"valutta": "kr", "enhet": null, "mengde": "- "}, "bilde": "https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png?w=640", "test_produkt": true};
const bruk_test_data = false;

module.exports = (database) => {
    const authentication = require("./authentication.js")(database);
    const produkter = database.collection("produkter");
    const users = database.collection("users");

    const api = express.Router();

    api.get("/produkter", async (req, res) => {
        const produkt_liste = await produkter.find({}).toArray();

        if (bruk_test_data) {
            for (let i = 0; i < 10; i++)
                produkt_liste.push(test_produkt);
        }
        res.json(produkt_liste);
    });

    api.post("/register", async (req, res) => {
        const username = req.body["username"];
        const password = req.body["password"];

        if (!(username && password)) {
            return res.json({"status": "error", "message": "Invalid request"});
        }

        authentication.register(username, password).then(token => {
            res.cookie("token", token, {httpOnly: true});

            res.json({"status": "success", "message": "Registrering velykket!"});
        }, error => {
            res.json({"status": "error", "message": error});
        })
    });

    api.post("/login", async (req, res) => {
        const username = req.body["username"];
        const password = req.body["password"];

        if (!(username && password)) {
            return res.json({"status": "error", "message": "Invalid request"});
        }

        authentication.login(username, password).then(token => {
            res.cookie("token", token, {httpOnly: true});

            res.json({"status": "success", "message": "Login velykket!"});
        }, error => {
            res.json({"status": "error", "message": error});
        })
    });

    api.all("/handlekurv", (req, res) => {
        if (!["GET", "POST"].includes(req.method)) {
            res.end("Unsupported method");
            return;
        }

        if (req.method === "POST" && JSON.stringify(req.body) >= 100_000) {
            res.status(400);
            res.end("For mange ting i handlekurven");
        }

        const token = req.cookies["token"];
        if (!token) {
            res.status(403);
            res.end("Not signed in");
        }

        authentication.get_token_user(req.cookies["token"]).then(user => {
            if (req.method === "GET") {
                res.json(user["handlekurv"]);
            } else {
                if (user) {
                    users.updateOne({_id: user._id}, {"$set": {"handlekurv": JSON.parse(JSON.stringify(req.body))}});
                    res.end("Ok!");
                } else {
                    res.status(401);
                    res.end("Not authorized!");
                }
            }
        }, error => {
            console.error(error);
            res.status(500);
            res.end("Server error");
        });

    });

    return api;
}