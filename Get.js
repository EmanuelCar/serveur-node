var co = require('./bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('./token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var add = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    cat = req.body.cat;
    console.log(tik.payload.Statut);
    if (cat && tik) {
        if (tik.payload.Statut == "membre") {
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
            console.log('access denied ');
            res.json({ message: "Vous n'avais pas les droits pour effectuer cette action  !" });
        }
    } else {
        console.log('Erreur dans la requête ');
        res.json({ message: "Veuillez remplir la categorie !" });
    }
}

var article = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN Localisation ON Localisation.Id_Localisation = Provenir.Id_Localisation WHERE Localisation.Lieux = ?",[tik.payload.Lieu],
            function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête');
                    res.json({ message: "echec de la requête" });
                } else {
                    console.log('Requête réussie !\n');
                    const articles = rows.map((row) => ({
                        Nom: row.Nom,
                        Stock: row.Stock,
                        Prix: row.Prix,
                        Description: row.Description,
                        Categorie: row.Categorie,
                        URL: row.URL
                    }))
                    res.json({ articles });
                }
            });
    } else {
        console.log('Erreur dans la requête ');
        res.json({ message: "Veuillez remplir le lieu !" });
    }
}

var articlebyprix = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN Localisation ON Localisation.Id_Localisation = Provenir.Id_Localisation WHERE Localisation.Lieux = ? ORDER BY Prix ASC",[tik.payload.Lieu],
            function (error, rows) {
                if (!!error) {
                    console.log('Requête réussie !\n');
                    res.json({ message: "echec de la requête" });
                } else {
                    console.log('Requête réussie !\n');
                    const articles = rows.map((row) => ({
                        Nom: row.Nom,
                        Stock: row.Stock,
                        Prix: row.Prix,
                        Description: row.Description,
                        Categorie: row.Categorie,
                        URL: row.URL
                    }))
                    res.json({ articles });
                }
            });
    } else {
        console.log('Erreur dans la requête ');
        res.json({ message: "Veuillez remplir le lieu !" });
    }
}

var eventpar = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    event = req.body.event;
    if (tik && event) {
        co.connection.query("INSERT INTO participer (Id_utilisateur,Id_evenements) SELECT Id_utilisateur, Id_evenements FROM utilisateur,evenement WHERE utilisateur.Id_utilisateur = ? AND evenement.Nom = ?", [tik.payload.Id, event], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "erreur de la requête" });
            } else {
                console.log('Requête réussie !\n');
                res.json({ message: "tu es bien inscrit" });
            }
        });
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

var addarticle = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var img = '';
    var nom = req.body.nom;
    var URL = req.body.URL;
    var cat = req.body.cat;
    var prix = req.body.prix;
    var lieux = req.body.lieux;
    var description = req.body.description;
    if (nom && URL && cat && prix && description && lieux && tik) {
        if (tik.payload.Statut == "membre") {
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
            console.log('access denied ');
            res.json({ message: "Vous n'avais pas les droits pour effectuer cette action  !" });
        }
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}


var liker = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var event = req.body.event;
    if (event && tik) {
        co.connection.beginTransaction(function (error) {
            co.connection.query("SELECT Id_evenements FROM evenement WHERE Nom = '" + event + "'", function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête 2 ');
                    res.json({ message: "erreur de la requête" });
                    co.connection.rollback(function () {
                    });
                } else if (rows[0] == null) {
                    console.log('Requête réussie');
                    res.json({ message: "l'évenement n'existe pas" });
                    co.connection.rollback(function () {
                    });
                } else {
                    eve = rows[0].Id_evenements;
                    co.connection.query("SELECT Aime,Commentaire FROM avis WHERE Id_utilisateur = ? AND Id_evenements = ?", [tik.payload.Id, eve], function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête 3');
                            res.json({ message: "erreur de la requête" });
                            co.connection.rollback(function () {
                            });
                        } else if (rows[0] == null) {
                            co.connection.query("INSERT INTO avis (Id_utilisateur,Id_evenements,Aime) VALUES (?,?,1) ", [tik.payload.Id, eve], function (error, rows) {
                                if (!!error) {
                                    console.log('Erreur dans la requête 4 ');
                                    res.json({ message: "erreur de la requête" });
                                    co.connection.rollback(function () {
                                    });
                                } else {
                                    co.connection.commit(function (error) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 4.5 ');
                                            res.json({ message: "erreur de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            console.log('Requête réussie !\n');
                                            res.json({ message: "Super like" });
                                        }
                                    });
                                }
                            });

                        } else {
                            if (rows[0].Aime == 0) {
                                co.connection.query("UPDATE avis SET Aime = 1 WHERE Id_evenements = ? AND Id_utilisateur = ?", [eve, tik.payload.Id],
                                    function (error, rows) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 5 ');
                                            res.json({ message: "erreur de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            co.connection.commit(function (error) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 5.5 ');
                                                    res.json({ message: "erreur de la requête" });
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    console.log('Requête réussie !\n');
                                                    res.json({ message: "Super like" });
                                                }
                                            });
                                        }
                                    });
                            } else if (rows[0].Commentaire == null) {
                                co.connection.query("DELETE FROM avis WHERE Id_evenements = ? AND Id_utilisateur = ?", [eve, tik.payload.Id],
                                    function (error, rows) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 5 ');
                                            res.json({ message: "erreur de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            co.connection.commit(function (error) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 5.5 ');
                                                    res.json({ message: "erreur de la requête" });
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    console.log('Requête réussie !\n');
                                                    res.json({ message: "Super unlike" });
                                                }
                                            });
                                        }
                                    });
                            } else {
                                co.connection.query("UPDATE avis SET Aime = 0 WHERE Id_evenements = ? AND Id_utilisateur = ?", [eve, tik.payload.Id],
                                    function (error, rows) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 6 ');
                                            res.json({ message: "erreur de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            co.connection.commit(function (error) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 6.5 ');
                                                    res.json({ message: "erreur de la requête" });
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    console.log('Requête réussie !\n');
                                                    res.json({ message: "Super unlike" });
                                                }
                                            });
                                        }
                                    });
                            }
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

var commandes = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT article.Nom, acheter.Quantite FROM `article` INNER JOIN acheter ON article.Id_Article = acheter.Id_Article INNER JOIN commande ON commande.Id_commande = acheter.id_commande INNER JOIN utilisateur On utilisateur.Id_utilisateur = commande.Id_utilisateur WHERE utilisateur.Id_utilisateur = ? AND commande.Fini = 0", [tik.payload.Id],
            function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête');
                    res.json({ message: "erreur de la requête" });
                } else {
                    const commande = rows.map((row) => ({
                        Article: row.Nom,
                        Quantite: row.Quantite,
                    }))
                    res.json({ commande });
                }
            });
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

var eventadd = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var nom = req.body.nom;
    var URL = req.body.URL;
    var description = req.body.description;
    var datef = req.body.datef;
    var dated = req.body.dated;
    var lieux = req.body.lieux;
    if (nom && URL && description && datef && dated && lieux && tik) {
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
                        co.connection.query("INSERT INTO evenement (Nom,Description,Date_debut,Date_fin,Id_Localisation) VALUES ('" + nom + "','" + description + "','" + dated + "','" + datef + "',(SELECT Id_Localisation FROM localisation WHERE Lieux = '" + lieux + "'))",
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

var suprcomm = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var nom = req.body.nom;
    var prenom = req.body.prenom;
    var event = req.body.event;
    var com = req.body.com;
    if (nom && prenom && event && com) {
        if (tik.payload.Statut == "membre") {
            co.connection.query("SELECT avis.Id_avis,avis.Aime FROM avis INNER JOIN evenement ON evenement.Id_evenements = avis.Id_evenements INNER JOIN utilisateur ON avis.Id_utilisateur = utilisateur.Id_utilisateur WHERE utilisateur.Nom = '" + nom + "' AND utilisateur.Prenom = '" + prenom + "' AND evenement.nom = '" + event + "' AND avis.Commentaire = '" + com + "'",
                function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                        res.json({ message: "erreur de la requête" });
                    } else if (rows[0] == null) {
                        console.log('Requête réussie');
                        res.json({ message: "le commentaire n'existe pas" });
                    } else if (rows[0].Aime == 1) {
                        co.connection.query("UPDATE avis SET Commentaire = NULL WHERE Id_avis = " + rows[0].Id_avis + "",
                            function (error, rows) {
                                if (!!error) {
                                    console.log('Erreur dans la requête 2 ');
                                    res.json({ message: "erreur de la requête" });
                                } else {
                                    console.log('Requête réussie !\n');
                                    res.json({ message: "Commentaire supprimé" });
                                }
                            });
                    } else {
                        co.connection.query("DELETE FROM avis WHERE Id_avis = " + rows[0].Id_avis + "",
                            function (error, rows) {
                                if (!!error) {
                                    console.log('Erreur dans la requête 3 ');
                                    res.json({ message: "erreur de la requête" });
                                } else {
                                    console.log('Requête réussie !\n');
                                    res.json({ message: "Commentaire supprimé" });
                                }

                            });

                    }
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

var suprphoto = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var URL = req.query.URL;
    if (URL) {
        if (tik.payload.Statut == "membre") {
            co.connection.query("DELETE FROM `image` WHERE URL = '" + URL + "'",
                function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête ');
                        res.json({ message: "erreur de la requête" });
                    } else {
                        console.log('Requête réussie !\n');
                        res.json({ message: "photo supprimée" });
                    }

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

var filtrecat = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN Localisation ON Localisation.Id_Localisation = Provenir.Id_Localisation WHERE Localisation.Lieux = ? ORDER BY Categorie ASC",[tik.payload.Lieu],
            function (error, rows) {
                if (!!error) {
                    console.log('Requête réussie !\n');
                    res.json({ message: "echec de la requête" });
                } else {
                    console.log('Requête réussie !\n');
                    const articles = rows.map((row) => ({
                        Nom: row.Nom,
                        Stock: row.Stock,
                        Prix: row.Prix,
                        Description: row.Description,
                        Categorie: row.Categorie,
                        URL: row.URL
                    }))
                    res.json({ articles });
                }
            });
    } else {
        console.log('Erreur dans la requête ');
        res.json({ message: "Veuillez remplir le lieu !" });
    }
}

var panier = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var article = req.body.article;
    var com = "";
    var quantite = req.body.quantite;
    if (article && quantite && tik) {
        co.connection.beginTransaction(function (error) {
            co.connection.query("SELECT Id_commande FROM commande INNER JOIN utilisateur ON utilisateur.Id_utilisateur = commande.Id_utilisateur WHERE utilisateur.Id_utilisateur = ? AND commande.Fini = 0",[tik.payload.Id],
                function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête 1');
                        co.connection.rollback(function () {
                        });
                        res.json({ message: "echec de la requête" });
                    } else if (rows[0] == null) {
                        co.connection.query("INSERT INTO commande (Id_utilisateur,Fini) VALUES (?,0) ",[tik.payload.Id], function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête 2 ');
                                res.json({ message: "echec de la requête" });
                                co.connection.rollback(function () {
                                });
                            } else {
                                co.connection.query("SELECT Id_commande FROM commande INNER JOIN utilisateur ON commande.Id_utilisateur = utilisateur.Id_utilisateur WHERE utilisateur.Id_utilisateur = ? AND commande.fini = 0",[tik.payload.Id],
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


module.exports = {
    add,
    article,
    addarticle,
    eventpar,
    articlebyprix,
    liker,
    commandes,
    eventadd,
    suprcomm,
    suprphoto,
    filtrecat,
    panier
};

