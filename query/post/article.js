var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Les membres du BDE peuvent ajouter une catégorie
var add = function (req, res) {
    cat = req.body.cat;
    if (cat) {
        co.connection.query("SELECT Nom FROM categorie WHERE Nom = '" + cat + "'", function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête 1 ');
                res.json({ message: "echec de la requête" });
            } else if (rows[0] != null) {
                console.log('Requête réussie !\n');
                res.json({ message: "Categorie deja existante" });
            }
            else {
                co.connection.query("INSERT INTO categorie (Nom) VALUES ('" + cat + "');",
                    function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête 2 ');
                            res.json({ message: "echec de la requête" });
                        } else {
                            console.log('Requête réussie !\n');
                            res.json({ message: "Ajout de la categorie d'article " + cat });
                        }
                    });
            }
        });
    } else {
        console.log('Erreur dans la requête ');
        res.json({ message: "Veuillez remplir la categorie !" });
    }
}

//Les membres du BDE peuvent ajouter un article
var addarticle = function (req, res) {
    var img = '';
    var nom = req.body.nom;
    var URL = req.body.URL;
    var cat = req.body.cat;
    var prix = req.body.prix;
    var lieux = req.body.lieux;
    var description = req.body.description;
    if (nom && URL && cat && prix && description && lieux) {
        co.connection.beginTransaction(function (error) {
            co.connection.query("SELECT Nom FROM article WHERE Nom = '" + nom + "'", function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête 1 ');
                    res.json({ message: "erreur de la requête" });
                } else if (rows[0] != null) {
                    console.log('Requête réussie !\n');
                    //console.log(rows);
                    res.json({ message: "Article deja existante" });
                }
                else {
                    co.connection.query("SELECT Id_image FROM Image WHERE URL = '" + URL + "'", function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête 4 ');
                            res.json({ message: "erreur de la requête" });
                            co.connection.rollback(function () {
                            });
                        } else if (rows[0] != null) {
                            console.log('Requête réussie');
                            res.json({ message: "Image utilisée sur un autre article" });
                            co.connection.rollback(function () {
                            });
                        } else {
                            co.connection.query("INSERT INTO image (URL) VALUES ('" + URL + "');",
                                function (error, rows) {
                                    if (!!error) {
                                        console.log('Erreur dans la requête 44 ');
                                        res.json({ message: "erreur de la requête" });
                                        co.connection.rollback(function () {
                                        });
                                    } else {
                                        co.connection.query("SELECT Id_image FROM image WHERE URL = '" + URL + "'", function (error, rows) {
                                            if (!!error) {
                                                console.log('Erreur dans la requête 45 ');
                                                res.json({ message: "erreur de la requête" });
                                                co.connection.rollback(function () {
                                                });
                                            } else {
                                                img = rows[0].Id_image;
                                                co.connection.query("SELECT Id_Categorie FROM Categorie WHERE Nom = '" + cat + "'", function (error, rows) {
                                                    if (!!error) {
                                                        console.log('Erreur dans la requête 3 ');
                                                        res.json({ message: "erreur de la requête" });
                                                        co.connection.rollback(function () {
                                                        });
                                                    } else if (rows[0] == null) {
                                                        console.log('Requête réussie');
                                                        res.json({ message: "Categorie inexistante" });
                                                        co.connection.rollback(function () {
                                                        });
                                                    } else {
                                                        var cat = rows[0].Id_Categorie;
                                                        co.connection.query("INSERT INTO article (Nom,Prix,Description,Id_Categorie,Id_image) VALUES ('" + nom + "'," + prix + ",'" + description + "'," + cat + "," + img + ")",
                                                            function (error, rows) {
                                                                if (!!error) {
                                                                    console.log('Erreur dans la requête 5 ');
                                                                    res.json({ message: "erreur de la requête" });
                                                                    co.connection.rollback(function () {
                                                                    });
                                                                }
                                                                co.connection.query("SELECT Id_Article FROM article WHERE Nom = '" + nom + "'", function (error, rows) {
                                                                    if (!!error) {
                                                                        console.log('Erreur dans la requête 6 ');
                                                                        res.json({ message: "erreur de la requête" });
                                                                        co.connection.rollback(function () {
                                                                        });
                                                                    } else {
                                                                        var id = rows[0].Id_Article;
                                                                        co.connection.query("UPDATE image SET Id_Article = " + id + " WHERE image.Id_image = " + img + "",
                                                                            function (error, rows) {
                                                                                if (!!error) {
                                                                                    console.log('Erreur dans la requête 7 ');
                                                                                    res.json({ message: "erreur de la requête" });
                                                                                    co.connection.rollback(function () {
                                                                                    });
                                                                                } else {
                                                                                    co.connection.query("INSERT INTO provenir (Id_Localisation,Id_Article) VALUES ((SELECT Id_Localisation FROM Localisation WHERE Lieux = '" + lieux + "')," + id + ")",
                                                                                        function (error, rows) {
                                                                                            if (!!error) {
                                                                                                console.log('Erreur dans la requête 8 ');
                                                                                                res.json({ message: "erreur de la requête" });
                                                                                                co.connection.rollback(function () {
                                                                                                });
                                                                                            } else {
                                                                                                co.connection.commit(function (error) {
                                                                                                    if (!!error) {
                                                                                                        console.log('Erreur dans la requête 9 ');
                                                                                                        res.json({ message: "erreur de la requête" });
                                                                                                        co.connection.rollback(function () {
                                                                                                        });
                                                                                                    } else {
                                                                                                        console.log('Requête réussie !\n');
                                                                                                        res.json({ message: "Ajout de l'article " + nom });
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                }
                                                                            });
                                                                    }
                                                                });
                                                            });
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
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

//Les membres du BDE peuvent supprimer un article
var suprarticle = function (req, res) {
    var article = req.body.article;
    var mail = req.body.mail;
    if (mail && article) {
        co.connection.query("SELECT mail FROM utilisateur WHERE mail = ?", [mail], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else if (rows.length == 0) {
                res.json({ message: "Cet utilisateur n'existe pas !" })
            } else {
                co.connection.query("SELECT Mail, Id_Statut FROM utilisateur WHERE Mail = ?", [mail], function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                        res.json({ message: "Erreur dans la requête !" });
                    } else if (rows[0].Id_Statut == 2) {
                        co.connection.query("SELECT Nom FROM article WHERE Nom = ?", [article], function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête');
                                res.json({ message: "Erreur dans la requête !" });
                            } else if (rows.length == 0) {
                                res.json({ message: "Cet article n'existe pas !" })
                            } else {
                                co.connection.query("DELETE FROM article WHERE Nom = ?", [article], function (error, rows) {
                                    if (!!error) {
                                        console.log('Erreur dans la requête');
                                        res.json({ message: "Erreur dans la requête !" });
                                    } else {
                                        res.json({ message: "L'article a bien été supprimé !" })
                                    }
                                })
                            }
                        })
                    } else {
                        res.json({ message: "Vous n'avez pas les droits pour supprimer un article !" })
                    }
                })
            }
        })
    } else if (mail) {
        co.connection.query("SELECT mail FROM utilisateur WHERE mail = ?", [mail], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else if (rows.length == 0) {
                res.json({ message: "Cet utilisateur n'existe pas !" })
            } else {
                res.json({ message: "Vous n'avez pas sélectionné d'article !" })
            }
        })
    } else {
        res.json({ message: "Vous n'êtes pas connecté, vous ne pouvez pas supprimer d'article !" })
    }
}

var best3 = function (req, res) {
    var lieu = req.body.lieu;
    if (lieu) {
        co.connection.query("SELECT Lieux FROM localisation WHERE Lieux = ?", [lieu], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else if (rows.length == 0) {
                res.json({ message: "Veuillez sélectionner une localisation valide !" })
            } else {
                co.connection.query("SELECT article.Nom, SUM(Quantite) AS Quantité_totale FROM acheter INNER JOIN article ON acheter.Id_Article = article.Id_Article INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN localisation ON localisation.Id_Localisation = provenir.Id_Localisation INNER JOIN commande ON acheter.Id_commande = commande.Id_commande WHERE commande.Fini = TRUE AND localisation.Lieux = ? GROUP BY article.Nom ORDER BY Quantité_totale DESC LIMIT 3", [lieu], function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                        res.json({ message: "Erreur dans la requête !" });
                    } else if (rows.length == 0) {
                        res.json({ message: "Il n'y a pas encore d'articles commandé !" })
                    } else if (rows.length == 1) {
                        res.json({
                            "Article 1":
                            {
                                "Nom": rows[0].Nom,
                                "Quantité": rows[0].Quantité_totale
                            }
                        })
                    } else if (rows.length == 2) {
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
        })
    } else {
        res.json({ message: "Veuillez saisir une localisation" });
    }
}

module.exports = {
    add,
	addarticle,
	suprarticle,
	best3
};