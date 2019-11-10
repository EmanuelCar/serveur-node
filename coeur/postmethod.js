var co = require('../bddconnect');
var express = require('express');
var session = require('express-session');

var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var statut = function (req, res) {
    co.connection.query("SELECT " + req.body.col + " FROM statut", function (error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête');
        } else {
            console.log('Requête réussie !');
            numRows = rows.length;
            for (var i = 0; i < numRows; i++) {
                res.write(JSON.stringify({
                    id: rows[i].Id_Statut,
                    Roles: rows[i].Roles,
                }));
            }
            res.end();
        }
    });
}

var userco = function (req, res) {
    var mail = req.body.mail;
    var password = req.body.password;

    if (mail && password) {
        co.connection.query("SELECT Id_utilisateur, Nom, Prenom, Mail, Password, statut.Roles, localisation.Lieux FROM utilisateur INNER JOIN statut ON utilisateur.Id_Statut = statut.Id_Statut INNER JOIN localisation ON utilisateur.Id_Localisation = localisation.Id_Localisation WHERE Mail = ? AND Password = ?", [mail, password], function (error, rows) {
            console.log(rows)
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if (rows.length > 0) {
                console.log('Requête réussie !');
                //req.session.loggedin = true;
                //req.session.mail = mail;
                res.json({ message: "Bienvenu " + rows[0].Prenom + " " + rows[0].Nom + " !" + ", vous êtes " + rows[0].Roles + ", vous vous trouvez à " + rows[0].Lieux })
                //res.redirect('/home');
            } else {
                res.send('Mail ou Mot de passe incorrect !');
            }

        });
    } else {
        res.send('Veuillez saisir un mail et un mot de passe !');
    }
}

var userinsc = function (req, res) {
    var nom = req.body.nom;
    var prenom = req.body.prenom;
    var mail = req.body.mail;
    var password = req.body.password;
    var lieu = req.body.lieu;
    var rgx = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

    if (nom && prenom && mail && password && lieu) {
        co.connection.query("SELECT Mail, Password FROM `utilisateur` WHERE Mail = ?", [mail], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if (password.length < 8) {
                res.send('Le mot de passe doit contenir au moins 8 caractères !');
            } else if (!rgx.test(password)) {
                res.send('Le mot de passe doit contenir au moins une lettre minuscule, une majuscule et un chiffre!');
            } else if(rows.length == 1) {
                res.send('Un compte avec cette adresse existe déjà !');
            } else {
                co.connection.query("INSERT INTO `utilisateur` (Nom, Prenom, Mail, Password, Id_Localisation) VALUES (?,?,?,?,?)", [nom, prenom, mail, password, lieu], function (error, rows) {
                    if (!!error) {
                        console.log("Erreur dans la requête d'envoi");
                    } else {
                        res.send('Compte créé avec succès !');
                    }
                })
            }
        })

    } else {
        res.send('Veuillez remplir tout les champs !');
    }
}

var addphoto = function (req, res) {
    var event = req.body.event;
    var url = req.body.url;
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    if (url && event) {
        co.connection.query("SELECT evenement.Id_evenements, evenement.Nom AS évènement, evenement.Date_fin, utilisateur.Prenom, utilisateur.Nom FROM evenement INNER JOIN participer ON participer.Id_evenements = evenement.Id_evenements INNER JOIN utilisateur ON participer.Id_Utilisateur = utilisateur.Id_Utilisateur WHERE evenement.Date_fin <= ? AND evenement.Nom = ?", [date, event], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if(rows.length == 0) {
                res.send("L'évènement n'existe pas ou il n'est pas encore passé !");
            } else {
                var id_evenement = rows[0].Id_evenements;
                co.connection.query("INSERT INTO `image` (URL, Id_evenements) VALUES (?, ?) ", [url, id_evenement], function (error, rows) {
                    if (!!error) {
                        console.log("Erreur dans la requête d'envoi");
                    } else {
                        res.send("L'image a bien été ajoutée !");
                    }
                })
            }
        })
    } else if (event) {
        res.send("veuillez sélectionner une image !");
    } else {
        res.send("veuillez sélectionner un évènement !");
    }
}

var recupphoto = function(req, res){
    co.connection.query("SELECT URL FROM image", function(error, rows){
        if (!!error) {
            console.log('Erreur dans la requête');
        } else {
            console.log('Requête réussie !');
            numRows = rows.length;
            for (var i = 0; i < numRows; i++) {
                var test = "URL" + " " + (i+1);
                res.write(JSON.stringify({
                    [test]: rows[i].URL
                }));
            }
            res.end();
        }
    });
}

var participant = function(req, res) {
    var event = req.body.event;
    if(event) {
        co.connection.query("SELECT evenement.Nom AS évènement, utilisateur.Nom, utilisateur.Prenom FROM participer INNER JOIN evenement ON participer.Id_evenements = evenement.Id_evenements INNER JOIN utilisateur ON participer.Id_Utilisateur = utilisateur.Id_Utilisateur WHERE evenement.Nom = ?", [event], function(error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if(rows.length == 0){
                res.send("veuillez sélectionner un évènement existant !")
            } else {
                res.write(JSON.stringify({
                    évènement: rows[0].évènement
                }));
                numRows = rows.length;
                for (var i = 0; i < numRows; i++) {
                    var nom = "Nom" + " " + (i+1);
                    var prenom = "Prenom" + " " + (i+1);
                    res.write(JSON.stringify({
                        [nom]: rows[i].Nom,
                        [prenom]: rows[i].Prenom
                    }));
                }
                res.end();
            }
        })
    } else {
        res.send("veuillez sélectionner un évènement !")
    }
}

var actuevent = function(req, res) {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    co.connection.query("SELECT Nom, Description, Date_debut, Date_fin, localisation.Lieux FROM evenement INNER JOIN localisation ON evenement.Id_Localisation = localisation.Id_Localisation WHERE Date_fin >= ?", [date], function(error, rows){
        if (!!error) {
            console.log('Erreur dans la requête');
        } else {
            numRows = rows.length;
            for (var i = 0; i < numRows; i++) {
                var event = "Évènement" + " " + (i+1);
                res.write(JSON.stringify({
                    [event]: rows[i].Nom,
                    Description: rows[i].Description,
                    "Date de début": rows[i].Date_debut,
                    "Date de fin": rows[i].Date_fin,
                    Lieu: rows[i].Lieux
                }));
            }
            res.end();
        } 
    })
}

module.exports = {
    statut,
    userco,
    userinsc,
    addphoto,
    recupphoto,
    participant,
    actuevent
};