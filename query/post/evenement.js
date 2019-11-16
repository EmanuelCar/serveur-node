var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//Participer à un évènement
var eventpar = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    event = req.body.event;
    if (tik && event) {
        co.connection.query("SELECT participer.Id_utilisateur, participer.Id_evenements FROM participer INNER JOIN evenement ON participer.Id_evenements = evenement.Id_evenements WHERE Id_utilisateur = ? AND evenement.Nom = ?", [tik.payload.Id, event], function(error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête 1');
                res.json({ message: "erreur de la requête" });
            } else if(rows.length == 1){
                res.json({ message: "tu es déjà inscrit à cet évènement !" });
            } else {
                co.connection.query("INSERT INTO participer (Id_utilisateur,Id_evenements) SELECT Id_utilisateur, Id_evenements FROM utilisateur,evenement WHERE utilisateur.Id_utilisateur = ? AND evenement.Nom = ? AND visible = TRUE", [tik.payload.Id, event], function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête 2');
                        res.json({ message: "erreur de la requête" });
                    } else {
                        co.connection.query("SELECT participer.Id_utilisateur, participer.Id_evenements FROM participer INNER JOIN evenement ON participer.Id_evenements = evenement.Id_evenements WHERE Id_utilisateur = ? AND evenement.Nom = ?", [tik.payload.Id, event], function(error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête');
                                res.json({ message: "erreur de la requête 3" });
                            } else if(rows.length == 0){
                                res.json({ message: "tu ne peux pas t'inscrire à cet évènement" });
                            } else {
                                res.json({ message: "tu es bien inscrit" });
                            }
                        })
                    }
                })
            }
        })
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

//Les membres du BDE peuvent ajouter un évènement
var eventadd = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var nom = req.body.nom;
    var URL = req.body.URL;
    var description = req.body.description;
    var datef = req.body.datef;
    var dated = req.body.dated;
    if (nom && URL && description && datef && dated && tik) {
        if (tik.payload.Statut == "membre") {
            co.connection.beginTransaction(function (error) {
                co.connection.query("SELECT Nom FROM evenement WHERE Nom = '" + nom + "'", function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête 1 ');
                        res.json({ message: "erreur de la requête" });
                    } else if (rows[0] != null) {
                        console.log('Requête réussie !\n');
                        res.json({ message: "evenement deja existante" });
                    } else {
                        co.connection.query("INSERT INTO evenement (Nom,Description,Date_debut,Date_fin,Id_Localisation) VALUES ('" + nom + "','" + description + "','" + dated + "','" + datef + "',(SELECT Id_Localisation FROM localisation WHERE Lieux = '" + tik.payload.Lieu + "'))",
                            function (error, rows) {
                                if (!!error) {
                                    console.log('Erreur dans la requête 2 ');
                                    res.json({ message: "erreur de la requête" });
                                    co.connection.rollback(function () {
                                    });
                                } else {
                                    co.connection.query("SELECT Id_evenements FROM evenement WHERE Nom = '" + nom + "'",
                                        function (error, rows) {
                                            if (!!error) {
                                                console.log('Erreur dans la requête 3 ');
                                                res.json({ message: "erreur de la requête" });
                                                co.connection.rollback(function () {
                                                });
                                            } else {
                                                var img = rows[0].Id_evenements
                                                co.connection.query("INSERT INTO image (URL,Id_evenements,Image_evenement) VALUES ('" + URL + "'," + img + ",1) ", function (error, rows) {
                                                    if (!!error) {
                                                        console.log('Erreur dans la requête 4 ');
                                                        res.json({ message: "erreur de la requête" });
                                                        co.connection.rollback(function () {
                                                        });
                                                    } else {
                                                        co.connection.commit(function (error) {
                                                            if (!!error) {
                                                                console.log('Erreur dans la requête 5 ');
                                                                res.json({ message: "erreur de la requête" });
                                                                co.connection.rollback(function () {
                                                                });
                                                            } else {
                                                                console.log('Requête réussie !\n');
                                                                res.json({ message: "Ajout de l'evenement " + nom });
                                                            }
                                                        });

                                                    }
                                                });
                                            }
                                        });
                                }
                            });
                    }
                });
            });
        } else {
            console.log('access denied ');
            res.json({ message: "Vous n'avais pas les droits pour effectuer cette action  !" });
        }
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

module.exports = {
    eventpar,
    eventadd
};