var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var statut = function (req, res) {
    co.connection.query("SELECT Id_Statut, Roles FROM statut", function (error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête');
            res.json({ message: "Erreur dans la requête !" });
        } else {
            console.log('Requête réussie !');
            const roles = rows.map((row) => ({
                id: row.Id_Statut,
                Roles: row.Roles
            }))
            res.json({ roles });
        }
    });
}

var lieu = function (req, res) {
    co.connection.query("SELECT Id_Localisation, Lieux FROM localisation", function (error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête');
            res.json({ message: "Erreur dans la requête !" });
        } else {
            console.log('Requête réussie !');
            const lieux = rows.map((row) => ({
                id: row.Id_Localisation,
                Ville: row.Lieux
            }))
            res.json({ lieux });
        }
    });
}

var event = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT Id_evenements, Nom, evenement.Id_Localisation FROM evenement INNER JOIN localisation ON evenement.Id_Localisation = localisation.Id_Localisation WHERE localisation.Lieux = ?", [tik.payload.Lieu], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else {
                console.log('Requête réussie !');
                console.log(rows.length);
                const évènements = rows.map((row) => ({
                    id: row.Id_evenements,
                    Nom: row.Nom
                }))
                res.json({ évènements });
            }
        });
    } else {
        res.json({message: "Aucun lieu n'a été sélectionné"})
    }
}

module.exports = {
    statut,
    lieu,
    event
};