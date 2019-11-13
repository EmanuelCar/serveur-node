var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var signal_event = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    event = req.body.event
    if (tik) {
        co.connection.query("UPDATE evenement SET visible = 0 WHERE Nom = ?", [event], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else {
                console.log('Requête réussie !');
                res.json({message: "L'évènement " + event + " est désormais invisible au public !"})
            }
        });
    } else {
        res.json({message: "Vous devez être connecté pour pouvoir signaler !"})
    }
}

var signal_comment = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    commentaire = req.body.commentaire
    if (tik) {
        co.connection.query("UPDATE avis SET visible = 0 WHERE commentaire = ?", [commentaire], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else {
                console.log('Requête réussie !');
                res.json({message: "Le commentaire " + commentaire + " est désormais invisible au public !"})
            }
        });
    } else {
        res.json({message: "Vous devez être connecté pour pouvoir signaler !"})
    }
}

var signal_photo = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    URL = req.body.URL
    if (tik) {
        co.connection.query("UPDATE image SET visible = 0 WHERE URL = ?", [URL], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else {
                console.log('Requête réussie !');
                res.json({message: "L'image : " + URL + " est désormais invisible au public !"})
            }
        });
    } else {
        res.json({message: "Vous devez être connecté pour pouvoir signaler !"})
    }
}

module.exports = {
    signal_event,
    signal_comment,
    signal_photo
};