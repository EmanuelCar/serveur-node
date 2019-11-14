var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Ajouter des articles au panier
var panier = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var article = req.body.article;
    var com = "";
    var quantite = req.body.quantite;
    if (article && quantite && tik) {
        co.connection.beginTransaction(function (error) {
            co.connection.query("SELECT Id_commande FROM commande INNER JOIN utilisateur ON utilisateur.Id_utilisateur = commande.Id_utilisateur WHERE utilisateur.Id_utilisateur = ? AND commande.Fini = 0", [tik.payload.Id],
                function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête 1');
                        co.connection.rollback(function () {
                        });
                        res.json({ message: "echec de la requête" });
                    } else if (rows[0] == null) {
                        co.connection.query("INSERT INTO commande (Id_utilisateur,Fini) VALUES (?,0) ", [tik.payload.Id], function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête 2 ');
                                res.json({ message: "echec de la requête" });
                                co.connection.rollback(function () {
                                });
                            } else {
                                co.connection.query("SELECT Id_commande FROM commande INNER JOIN utilisateur ON commande.Id_utilisateur = utilisateur.Id_utilisateur WHERE utilisateur.Id_utilisateur = ? AND commande.fini = 0", [tik.payload.Id],
                                    function (error, rows) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 3');
                                            res.json({ message: "echec de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            com = rows[0].Id_commande;
                                            co.connection.query("INSERT INTO acheter (Id_commande,Id_Article) SELECT Id_commande, Id_Article FROM commande,article WHERE article.Nom = '" + article + "' AND commande.Id_commande = " + com + "",
                                                function (error, rows) {
                                                    if (!!error) {
                                                        console.log('Erreur dans la requête 4 ');
                                                        res.json({ message: "echec de la requête" });
                                                        co.connection.rollback(function () {
                                                        });
                                                    } else {
                                                        co.connection.query("UPDATE acheter SET Quantite = " + quantite + " WHERE Id_commande = " + com + "",
                                                            function (error, rows) {
                                                                if (!!error) {
                                                                    console.log('Erreur dans la requête 4.5 ');
                                                                    res.json({ message: "echec de la requête" });
                                                                    co.connection.rollback(function () {
                                                                    });
                                                                } else {
                                                                    co.connection.commit(function (error) {
                                                                        if (!!error) {
                                                                            console.log('Erreur dans la requête 5 ');
                                                                            res.json({ message: "echec de la requête" });
                                                                            co.connection.rollback(function () {
                                                                            });
                                                                        } else {
                                                                            console.log('Requête réussie !\n');
                                                                            res.json({ message: "Ajout de la commande" });
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

                    } else {
                        com = rows[0].Id_commande;
                        console.log(article);
                        co.connection.query("SELECT acheter.Id_Article FROM acheter INNER JOIN article ON acheter.Id_Article = article.Id_Article WHERE article.Nom = '" + article + "' AND acheter.Id_commande = " + com + " ",
                            function (error, rows) {
                                if (!!error) {
                                    console.log('Erreur dans la requête 5.5');
                                    res.json({ message: "echec de la requête" });
                                    co.connection.rollback(function () {
                                    });
                                } else if (rows[0] == null) {
                                    co.connection.query("INSERT INTO acheter (Id_commande,Id_Article,Quantite) VALUES (" + com + ",(SELECT Id_Article FROM article WHERE article.Nom = '" + article + "'), " + quantite + ")",
                                        function (error, rows) {
                                            if (!!error) {
                                                console.log('Erreur dans la requête 6 ');
                                                res.json({ message: "echec de la requête" });
                                                co.connection.rollback(function () {
                                                });
                                            } else {
                                                co.connection.commit(function (error) {
                                                    if (!!error) {
                                                        console.log('Erreur dans la requête 7 ');
                                                        res.json({ message: "echec de la requête" });
                                                        co.connection.rollback(function () {
                                                        });
                                                    } else {
                                                        console.log('Requête réussie !\n');
                                                        res.json({ message: "Ajout de la commande" });
                                                    }
                                                });
                                            }

                                        });
                                } else {
                                    article = rows[0].Id_Article;
                                    co.connection.query("UPDATE acheter SET Quantite = " + quantite + " WHERE Id_commande = " + com + " AND Id_article = " + article + "",
                                        function (error, rows) {
                                            if (!!error) {
                                                console.log('Erreur dans la requête 8 ');
                                                res.json({ message: "echec de la requête" });
                                                co.connection.rollback(function () {
                                                });
                                            } else {
                                                co.connection.commit(function (error) {
                                                    if (!!error) {
                                                        console.log('Erreur dans la requête 9 ');
                                                        res.json({ message: "echec de la requête" });
                                                        co.connection.rollback(function () {
                                                        });
                                                    } else {
                                                        console.log('Requête réussie !\n');
                                                        res.json({ message: "Ajout de la commande" });
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
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

//Passer sa commande
var passcommand = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT Mail, Id_utilisateur FROM utilisateur WHERE Mail = ?", [tik.payload.Id], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else if (rows.length == 0) {
                res.json({ message: "Cet utilisateur n'existe pas !" })
            } else {
                co.connection.query("SELECT Id_commande FROM commande WHERE Id_utilisateur = ?", [tik.payload.Id], function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                        res.json({ message: "Erreur dans la requête !" });
                    } else if (rows.length == 0) {
                        res.json({ message: "Vous n'avez pas de commande en cours !" })
                    } else {
                        co.connection.query("UPDATE commande SET Fini = TRUE WHERE Id_utilisateur = ?", [tik.payload.Id], function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête');
                                res.json({ message: "Erreur dans la requête !" });
                            } else {
                                res.json({ message: "La commande a bien été passée !" })
                            }
                        })
                    }
                })
            }
        })
    } else {
        res.json({ message: "Veuillez vous connecter !" })
    }
}

//Supprimer des articles du panier
var suprpanier = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var article = req.body.article;
    var com = "";
    if (article && tik) {
        co.connection.query("SELECT acheter.Id_Article,acheter.Id_commande FROM acheter INNER JOIN article ON article.Id_Article = acheter.Id_Article INNER JOIN commande ON commande.Id_commande = acheter.Id_commande WHERE commande.Fini = 0 AND article.Nom = ? AND commande.Id_utilisateur = ? ", [article, tik.payload.Id],
            function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête 1 ');
                    res.json({ message: "echec de la requête" });
                } else if (rows[0] == null) {
                    console.log('Requête réussie');
                    res.json({ message: "l'article n'existe pas" });
                } else {
                    co.connection.query("DELETE FROM acheter WHERE Id_Article = ? and Id_commande = ?", [rows[0].Id_Article, rows[0].Id_commande],
                        function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête 1 ');
                                res.json({ message: "echec de la requête" });
                            } else {
                                console.log('Requête réussie !\n');
                                res.json({ message: "suppresion de la commande" });
                            }

                        });
                }
            });
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

module.exports = {
    panier,
    passcommand,
    suprpanier
};