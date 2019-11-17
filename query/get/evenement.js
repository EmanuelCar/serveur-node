var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Afficher les évènements qui ne sont pas encore passés
var actuevent = function (req, res) {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT Lieux FROM localisation WHERE Lieux = ?", [tik.payload.Lieu], function (error, rows) {
            if (rows.length == 0) {
                res.json({ message: "Veuillez sélectionner une localisation existante !" });
            } else {
                co.connection.query("SELECT Nom, Description, Date_debut, Date_fin, evenement.visible, localisation.Lieux, image.URL FROM evenement INNER JOIN image ON evenement.Id_evenements = image.Id_evenements INNER JOIN localisation ON evenement.Id_Localisation = localisation.Id_Localisation WHERE Date_fin >= ? AND localisation.Lieux = ? AND Image_evenement = 1 AND evenement.visible = 1", [date, tik.payload.Lieu], function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                        res.json({ message: "Erreur dans la requête !" });
                    } else {
                        const évènements = rows.map((row) => ({
                            évènement: row.Nom,
                            URL: row.URL,
                            Description: row.Description,
                            "Date de début": row.Date_debut,
                            "Date de fin": row.Date_fin,
                            Lieu: row.Lieux
                        }))
                        res.json({
                            évènements,
                            message: "Liste des évènements actuels"
                        });
                    }
                })
            }
        })

    } else {
        res.json({ message: "Veuillez sélectionner un lieu !" });
    }
}

//Afficher les évènements passés
var pactuevent = function (req, res) {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT Lieux FROM localisation WHERE Lieux = ?", [tik.payload.Lieu], function (error, rows) {
            if (rows.length == 0) {
                res.json({ message: "Veuillez sélectionner une localisation existante !" });
            } else {
                co.connection.query("SELECT Nom, Description, Date_debut, Date_fin, evenement.visible, localisation.Lieux, image.URL FROM evenement INNER JOIN image ON evenement.Id_evenements = image.Id_evenements INNER JOIN localisation ON evenement.Id_Localisation = localisation.Id_Localisation WHERE Date_fin < ? AND localisation.Lieux = ? AND Image_evenement = 1 AND evenement.visible = TRUE", [date, tik.payload.Lieu], function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                        res.json({ message: "Erreur dans la requête !" });
                    } else {
                        const évènements = rows.map((row) => ({
                            évènement: row.Nom,
                            URL: row.URL,
                            Description: row.Description,
                            "Date de début": row.Date_debut,
                            "Date de fin": row.Date_fin,
                            Lieu: row.Lieux
                        }))
                        co.connection.query("SELECT Nom, Description, Date_debut, Date_fin, evenement.visible, localisation.Lieux, image.URL FROM evenement INNER JOIN image ON evenement.Id_evenements = image.Id_evenements INNER JOIN localisation ON evenement.Id_Localisation = localisation.Id_Localisation WHERE Date_fin < ? AND localisation.Lieux = ? AND Image_evenement = 0 AND evenement.visible = TRUE AND image.visible = TRUE", [date, tik.payload.Lieu], function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête');
                                res.json({ message: "Erreur dans la requête !" });
                            } else {
                                const photo = rows.map((row) => ({
                                    évènement: row.Nom,
                                    URL: row.URL,
                                   
                                }))
                                res.json({
                                    évènements,photo,
                                    message: "Liste des évènements passés"
                                });
                            }
                        });
                    }
                })
            }
        })
    } else {
        res.json({ message: "Veuillez sélectionner un lieu !" });
    }
}

module.exports = {
    actuevent,
    pactuevent
};