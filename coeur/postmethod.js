var co = require('../bddconnect');
var express = require('express');
var session = require('express-session');

var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*app.use(session({
    secret: 'arft36587rsnj3rr4u5j3',
    name: 'cookie',
    proxy: true,
    resave: true,
    saveUninitialized: true,
    loggedin: false
}))*/

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
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if (rows.length > 0) {
                console.log('Requête réussie !');
                //req.session.loggedin = true;
                //req.session.mail = mail;
                res.json({
                    "Prenom" : rows[0].Prenom,
                    "Nom" : rows[0].Nom,
                    "Role" : rows[0].Roles,
                    "Localisation" : rows[0].Lieux 
                })
                //res.redirect('/home');
            } else {
                res.json({message : 'Mail ou Mot de passe incorrect !'});
            }

        });
    } else {
        res.json({message: 'Veuillez saisir un mail et un mot de passe !'});
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
                res.json({message: 'Le mot de passe doit contenir au moins 8 caractères !'});
            } else if (!rgx.test(password)) {
                res.json({message: 'Le mot de passe doit contenir au moins une lettre minuscule, une majuscule et un chiffre!'});
            } else if(rows.length == 1) {
                res.json({message: 'Un compte avec cette adresse existe déjà !'});
            } else {
                co.connection.query("INSERT INTO `utilisateur` (Nom, Prenom, Mail, Password, Id_Localisation) VALUES (?,?,?,?,?)", [nom, prenom, mail, password, lieu], function (error, rows) {
                    if (!!error) {
                        console.log("Erreur dans la requête d'envoi");
                    } else {
                        res.json({message: 'Compte créé avec succès !'});
                    }
                })
            }
        })

    } else {
        res.json({message: 'Veuillez remplir tout les champs !'});
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
                res.json({message: "L'évènement n'existe pas ou il n'est pas encore passé !"});
            } else {
                var id_evenement = rows[0].Id_evenements;
                co.connection.query("INSERT INTO `image` (URL, Id_evenements) VALUES (?, ?) ", [url, id_evenement], function (error, rows) {
                    if (!!error) {
                        console.log("Erreur dans la requête d'envoi");
                    } else {
                        res.json({message: "L'image a bien été ajoutée !"});
                    }
                })
            }
        })
    } else if (event) {
        res.json({message: "veuillez sélectionner une image !"});
    } else {
        res.json({message: "veuillez sélectionner un évènement !"});
    }
}

var recupphoto = function(req, res){
    co.connection.query("SELECT URL FROM image", function(error, rows){
        if (!!error) {
            console.log('Erreur dans la requête');
        } else {
            console.log('Requête réussie !');
            res.write("[");
            numRows = rows.length;
            for (var i = 0; i < numRows; i++) {
                if(i != 0){
                    res.write(",");
                }
                var test = "URL" + " " + (i+1);
                res.write(JSON.stringify({
                    [test]: rows[i].URL
                }));
            }
            res.write("]");
            res.end();
        }
    });
}

var participant = function(req, res) {
    var event = req.body.event;
    if(event) {
        co.connection.query("SELECT Nom FROM evenement WHERE Nom = ?", [event], function(error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if(rows.length == 0){
                res.json({message: "veuillez sélectionner un évènement existant !"})
            } else {
                co.connection.query("SELECT evenement.Nom AS évènement, utilisateur.Nom, utilisateur.Prenom FROM participer INNER JOIN evenement ON participer.Id_evenements = evenement.Id_evenements INNER JOIN utilisateur ON participer.Id_Utilisateur = utilisateur.Id_Utilisateur WHERE evenement.Nom = ?", [event], function(error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête');
                } else if(rows.length == 0){
                    res.json({message: "Il n'y a pas encore de participant à cet évènement !"})
                } else {
                    res.write("{");
                    res.write('"évènement"' + ": " + '"' + rows[0].évènement + '"' + ",");
                    res.write('"participants"' + ": ");
                    res.write("[");
                    numRows = rows.length;
                    for (var i = 0; i < numRows; i++) {
                        var nom = "Nom" + " " + (i+1);
                        var prenom = "Prenom" + " " + (i+1);
                        if(i != 0){
                            res.write(",");
                        }
                        res.write(JSON.stringify({
                            [nom]: rows[i].Nom,
                            [prenom]: rows[i].Prenom
                        }));
                    }
                    res.write("]");
                    res.write("}");
                    res.end();
                }
            })
        }
    })
    } else {
        res.json({message: "veuillez sélectionner un évènement !"})
    }
}

var actuevent = function(req, res) {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    co.connection.query("SELECT Nom, Description, Date_debut, Date_fin, localisation.Lieux FROM evenement INNER JOIN localisation ON evenement.Id_Localisation = localisation.Id_Localisation WHERE Date_fin >= ?", [date], function(error, rows){
        if (!!error) {
            console.log('Erreur dans la requête');
        } else {
            res.write("{");
            res.write('"Évènements"' + ": ");
            res.write("[");
            numRows = rows.length;
            for (var i = 0; i < numRows; i++) {
                var event = "Évènement" + " " + (i+1);
                if(i != 0){
                    res.write(",");
                }
                res.write(JSON.stringify({
                    [event]: rows[i].Nom,
                    Description: rows[i].Description,
                    "Date de début": rows[i].Date_debut,
                    "Date de fin": rows[i].Date_fin,
                    Lieu: rows[i].Lieux
                }));
            }
            res.write("]");
            res.write("}");
            res.end();
        } 
    })
}

var comment = function(req, res) {
    var commentaire = req.body.commentaire;
    var mail = req.body.mail;
    var event = req.body.event;
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    if(mail && commentaire && event) {
        co.connection.query("SELECT Mail, Id_utilisateur FROM utilisateur WHERE Mail = ?", [mail], function(error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if(rows.length == 0){
                res.json({message: "Cet utilisateur n'existe pas !"})
            } else {
                var id_ut = rows[0].Id_utilisateur
                co.connection.query("SELECT Nom, Id_evenements FROM evenement WHERE Nom = ? AND Date_fin <= ?", [event, date], function(error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                    } else if(rows.length == 0){
                        res.json({message: "Cet évènement n'existe pas ou n'est pas encore passé !"})
                    } else {
                        var id_ev = rows[0].Id_evenements
                        co.connection.query("INSERT INTO avis (Commentaire, Id_utilisateur, Id_evenements) VALUE (?, ?, ?)", [commentaire, id_ut, id_ev], function(error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête');
                            } else {
                                res.json({message: "Votre commentaire a bien été ajouté !"})
                            }
                        })
                    }
                })
            }
        })
    } else if(mail && event) {
        co.connection.query("SELECT Mail FROM utilisateur WHERE Mail = ?", [mail], function(error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if(rows.length == 0){
                res.json({message: "Cet utilisateur n'existe pas !"})
            } else {
                co.connection.query("SELECT Nom FROM evenement WHERE Nom = ?", [event], function(error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                    } else if(rows.length == 0){
                        res.json({message: "Cet évènement n'existe pas !"})
                    } else {
                        res.json({message: "Vous n'avez pas entré de commentaire !"});
                    }
                })
            }
        })
    } else if(mail){
        co.connection.query("SELECT mail FROM utilisateur WHERE mail = ?", [mail], function(error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if(rows.length == 0){
                res.json({message: "Cet utilisateur n'existe pas !"})
            } else {
                res.json({message: "Vous n'avez pas sélectionné d'évènement !"})
            }
        })
    } else {
        res.json({message: "Vous n'êtes pas connecté, vous ne pouvez pas laisser de commentaire !"})
    }
}

var suprarticle = function(req, res) {
    var article = req.body.article;
    var mail = req.body.mail;
    if(mail && article){
        co.connection.query("SELECT mail FROM utilisateur WHERE mail = ?", [mail], function(error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if(rows.length == 0){
                res.json({message: "Cet utilisateur n'existe pas !"})
            } else {
                co.connection.query("SELECT Mail, Id_Statut FROM utilisateur WHERE Mail = ?", [mail], function(error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                    } else if(rows[0].Id_Statut == 2){
                        co.connection.query("SELECT Nom FROM article WHERE Nom = ?", [article], function(error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête');
                            } else if(rows.length == 0){
                                res.json({message: "Cet article n'existe pas !"})
                            } else {
                                co.connection.query("DELETE FROM article WHERE Nom = ?", [article], function(error, rows) {
                                    if (!!error) {
                                        console.log('Erreur dans la requête');
                                    } else {
                                        res.json({message: "L'article a bien été supprimé !"})
                                    }
                                })
                            }
                        })
                    } else {
                        res.json({message: "Vous n'avez pas les droits pour supprimer un article !"})
                    }
                })
            }
        })
    } else if (mail) {
        co.connection.query("SELECT mail FROM utilisateur WHERE mail = ?", [mail], function(error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if(rows.length == 0){
                res.json({message: "Cet utilisateur n'existe pas !"})
            } else {
                res.json({message: "Vous n'avez pas sélectionné d'article !"})
            }
        })
    } else {
        res.json({message: "Vous n'êtes pas connecté, vous ne pouvez pas supprimer d'article !"})
    }
}

var passcommand = function (req, res) {
    var mail = req.body.mail;
    if(mail) {
        co.connection.query("SELECT Mail, Id_utilisateur FROM utilisateur WHERE Mail = ?", [mail], function(error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if(rows.length == 0){
                res.json({message: "Cet utilisateur n'existe pas !"})
            } else {
                var id_ut = rows[0].Id_utilisateur;
                co.connection.query("SELECT Id_commande FROM commande WHERE Id_utilisateur = ?", [rows[0].Id_utilisateur], function(error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                    } else if(rows.length == 0){
                        res.json({message: "Vous n'avez pas de commande en cours !"})
                    } else {
                        co.connection.query("UPDATE commande SET Fini = TRUE WHERE Id_utilisateur = ?", [id_ut], function(error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête');
                            } else {
                                res.json({message: "La commande a bien été passée !"})
                            }
                        })
                    }
                })
            }
        })
    } else {
        res.json({message: "Veuillez vous connecter !"})
    }
}

var best3 = function(req, res) {
    co.connection.query("SELECT article.Nom, SUM(Quantite) AS Quantité_totale FROM acheter INNER JOIN article ON acheter.Id_Article = article.Id_Article INNER JOIN commande ON acheter.Id_commande = commande.Id_commande WHERE commande.Fini = TRUE GROUP BY article.Nom ORDER BY Quantité_totale DESC LIMIT 3", function(error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête');
        } else if(rows.length == 0){
            res.json({message: "Il n'y a pas encore d'articles commandé !"})
        } else if(rows.length == 1) {
            res.json({
                "Article 1":
                {
                    "Nom": rows[0].Nom,
                    "Quantité": rows[0].Quantité_totale
                }
            })
        } else if(rows.length == 2) {
            res.json({
                "Article 1":
                {
                    "Nom": rows[0].Nom,
                    "Quantité": rows[0].Quantité_totale
                },
                "Article 2":
                {
                    "Nom": rows[1].Nom,
                    "Quantité": rows[1].Quantité_totale
                }
            })
        } else {
            res.json({
                "Article 1":
                {
                    "Nom": rows[0].Nom,
                    "Quantité": rows[0].Quantité_totale
                },
                "Article 2":
                {
                    "Nom": rows[1].Nom,
                    "Quantité": rows[1].Quantité_totale
                },
                "Article 3":
                {
                    "Nom": rows[2].Nom,
                    "Quantité": rows[2].Quantité_totale
                }
            })
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
    actuevent,
    comment,
    suprarticle,
    passcommand,
    best3
};