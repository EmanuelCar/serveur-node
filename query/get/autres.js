var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Récupérer la liste des roles
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

//Récupérer la liste des lieux
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

//Récupérer la liste des évènements
var event = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT Id_evenements, Nom, evenement.Id_Localisation FROM evenement INNER JOIN localisation ON evenement.Id_Localisation = localisation.Id_Localisation WHERE localisation.Lieux = ? AND visible = TRUE", [tik.payload.Lieu], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else {
                console.log('Requête réussie !');
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

//Récupérer la liste des photos visibles
var photo = function(req, res) {
    co.connection.query("SELECT evenement.Nom AS event, URL FROM image INNER JOIN evenement ON image.Id_evenements = evenement.Id_evenements WHERE image.visible = TRUE AND Image_evenement = 0", function(error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête');
            res.json({ message: "Erreur dans la requête !" });
        } else {
            const photos = rows.map((row) => ({
                Évènement: row.event,
                URL: row.URL,
            }))
            res.json({ photos });
        }
    })
}

//Récupérer la liste des commentaires visibles 
var recupcomment = function(req, res) {
    co.connection.query("SELECT evenement.Nom AS event, URL, utilisateur.Nom, utilisateur.Prenom, avis.commentaire FROM image INNER JOIN evenement ON image.Id_evenements = evenement.Id_evenements INNER JOIN avis ON image.Id_image = avis.Id_image INNER JOIN utilisateur ON avis.Id_utilisateur = utilisateur.Id_utilisateur WHERE avis.visible = TRUE AND Image_evenement = 0", function(error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête');
            res.json({ message: "Erreur dans la requête !" });
        } else {
            const photos = rows.map((row) => ({
                Évènement: row.event,
                URL: row.URL,
                Nom: row.Nom,
                Prenom: row.Prenom,
                Commentaire: row.commentaire
            }))
            res.json({ photos });
        }
    })
}

//Récupérer la liste des catégories
var recupcategorie = function(req, res) {
    co.connection.query("SELECT Nom FROM categorie", function(error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête');
            res.json({ message: "Erreur dans la requête !" });
        } else {
            const catégories = rows.map((row) => ({
                Nom: row.Nom
            }))
            res.json({ catégories });
        }
    })
}

module.exports = {
    statut,
    lieu,
    event,
    photo,
    recupcomment,
    recupcategorie
};