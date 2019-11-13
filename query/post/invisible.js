var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Un membre du BDE peut rendre un évènement invisible au public
var invisible_event = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    event = req.body.event
    if (tik) {
        if (tik.payload.Statut == "membre") {
            co.connection.query("UPDATE evenement SET visible = 0 WHERE Nom = ?", [event], function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête');
                    res.json({ message: "Erreur dans la requête !" });
                } else {
                    console.log('Requête réussie !');
                    res.json({ message: "L'évènement " + event + " est désormais invisible au public !" })
                }
            });
        } else {
            res.json({ message: "Vous n'avez pas les droits pour rendre l'évènement invisible !" })
        }
    } else {
        res.json({ message: "Vous devez être connecté pour pouvoir rendre l'évènement invisible !" })
    }
}

//Un membre du BDE peut rendre un commentaire invisible au public
var invisible_comment = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    commentaire = req.body.commentaire
    if (tik) {
        if (tik.payload.Statut == "membre") {
            co.connection.query("UPDATE avis SET visible = 0 WHERE commentaire = ?", [commentaire], function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête');
                    res.json({ message: "Erreur dans la requête !" });
                } else {
                    console.log('Requête réussie !');
                    res.json({ message: "Le commentaire " + commentaire + " est désormais invisible au public !" })
                }
            });
        } else {
            res.json({ message: "Vous n'avez pas les droits pour rendre le commentaire invisible !" })
        }
    } else {
        res.json({ message: "Vous devez être connecté pour pouvoir rendre le commentaire invisible !" })
    }
}

//Un membre du BDE peut rendre une photo invisible au public
var invisible_photo = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    URL = req.body.URL
    if (tik) {
        if (tik.payload.Statut == "membre") {
            co.connection.query("UPDATE image SET visible = 0 WHERE URL = ?", [URL], function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête');
                    res.json({ message: "Erreur dans la requête !" });
                } else {
                    console.log('Requête réussie !');
                    res.json({ message: "L'image : " + URL + " est désormais invisible au public !" })
                }
            });
        } else {
            res.json({ message: "Vous n'avez pas les droits pour rendre la photo invisible !" })
        }
    } else {
        res.json({ message: "Vous devez être connecté pour pouvoir rendre la photo invisible !" })
    }
}

module.exports = {
    invisible_event,
    invisible_comment,
    invisible_photo
};