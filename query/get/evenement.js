var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Les membres du BDE peuvent récupéérer la liste des participants  
var participant = function (req, res) {
    var event = req.body.event;
    tik = jwt.decodeTokenForUser(req, res);
    if (event && tik) {
        if (tik.payload.Statut == "membre") {
            co.connection.query("SELECT Nom FROM evenement WHERE Nom = ?", [event], function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête');
                    res.json({ message: "Erreur dans la requête !" });
                } else if (rows.length == 0) {
                    res.json({ message: "veuillez sélectionner un évènement existant !" })
                } else {
                    co.connection.query("SELECT evenement.Nom AS évènement, utilisateur.Nom, utilisateur.Prenom FROM participer INNER JOIN evenement ON participer.Id_evenements = evenement.Id_evenements INNER JOIN utilisateur ON participer.Id_Utilisateur = utilisateur.Id_Utilisateur WHERE evenement.Nom = ?", [event], function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête');
                            res.json({ message: "Erreur dans la requête !" });
                        } else if (rows.length == 0) {
                            res.json({ message: "Il n'y a pas encore de participant à cet évènement !" })
                        } else {
                            const participants = rows.map((row) => ({
                                Nom: row.Nom,
                                Prenom: row.Prenom,
                            }))
                            res.json({ participants });
                        }
                    })
                }
            })
        } else {
            res.json({ message: "Vous devez être un membre du BDE pour pouvoir télécharger la liste des participants" });
        }
    } else {
        res.json({ message: "veuillez sélectionner un évènement !" })
    }
}

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
                co.connection.query("SELECT Nom, Description, Date_debut, Date_fin, evenement.visible, localisation.Lieux, image.URL FROM evenement INNER JOIN image ON evenement.Id_evenements = image.Id_evenements INNER JOIN localisation ON evenement.Id_Localisation = localisation.Id_Localisation WHERE Date_fin >= ? AND localisation.Lieux = ? AND Image_evenement = 1 AND evenement.visible = TRUE", [date, tik.payload.Lieu], function (error, rows) {
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
                        res.json({ évènements });
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
                        res.json({ évènements });
                    }
                })
            }
        })
    } else {
        res.json({ message: "Veuillez sélectionner un lieu !" });
    }
}

module.exports = {
    participant,
    actuevent,
    pactuevent
};