var co = require('../../database/bddconnect');
var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('../../jwt/token.js');
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Se connecter avec ses identifiants
var userco = function (req, res) {
    var mail = req.body.mail;
    var password = req.body.password;

    if (mail && password) {
        co.connection.query("SELECT Id_utilisateur, Nom, Prenom, Mail, Password, statut.Roles, localisation.Lieux FROM utilisateur INNER JOIN statut ON utilisateur.Id_Statut = statut.Id_Statut INNER JOIN localisation ON utilisateur.Id_Localisation = localisation.Id_Localisation WHERE Mail = ?", [mail], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else if (rows.length > 0) {
                bcrypt.compare(password, rows[0].Password, function (errBycrypt, resBycrypt) {
                    if (resBycrypt) {
                        console.log('Requête réussie !');
                        res.json({
                            Id_user: rows[0].Id_utilisateur,
                            token: jwt.generateTokenForUser(rows[0]),
                            role: rows[0].Roles, 
                            message: 'Vous êtes bien connecté !'
                        })
                    } else {
                        res.json({ message: 'Mot de passe incorrect !' });
                    }
                })
            } else {
                res.json({ message: 'Mail incorrect !' });
            }
        });
    } else {
        res.json({ message: 'Veuillez saisir un mail et un mot de passe !' });
    }
}

//s'enregistrer
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
                res.json({ message: "Erreur dans la requête !" });
            } else if (password.length < 8) {
                res.json({ message: 'Le mot de passe doit contenir au moins 8 caractères !' });
            } else if (!rgx.test(password)) {
                res.json({ message: 'Le mot de passe doit contenir au moins une lettre minuscule, une majuscule et un chiffre !' });
            } else if (rows.length == 1) {
                res.json({ message: 'Un compte avec cette adresse existe déjà !' });
            } else {
                bcrypt.hash(password, 8, function (err, bcryptedPassword) {
                    co.connection.query("INSERT INTO `utilisateur` (Nom, Prenom, Mail, Password, Id_Localisation) VALUES (?,?,?,?,?)", [nom, prenom, mail, bcryptedPassword, lieu], function (error, rows) {
                        if (!!error) {
                            console.log("Erreur dans la requête d'envoi");
                            res.json({ message: "Erreur dans la requête !" });
                        } else {
                            res.json({
                                message: 'Compte créé avec succès !',
                            });
                        }
                    })
                })
            }
        })

    } else {
        res.json({ message: 'Veuillez remplir tout les champs !' });
    }
}

module.exports = {
    userco,
    userinsc
};