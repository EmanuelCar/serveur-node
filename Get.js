var co = require('./bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


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
        console.log('Erreur dans la requête 2 ');
        res.json({ message: "Veuillez remplir la categorie !" });
    }
}

var article = function (req, res) {
    co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image",
        function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "echec de la requête" });
            } else {
                console.log('Requête réussie !\n');
                res.write("{")
                res.write('"' + 'Vente' + '"' + ": ")
                res.write("[")
                for (var i = 0; i < rows.length; i++) {
                    var test = "Article" + " " + i;
                    if (i != 0) {
                        res.write(",");
                    }
                    res.write(JSON.stringify({
                        [test]: {
                            Nom: rows[i].Nom,
                            Stock: rows[i].Stock,
                            Prix: rows[i].Prix,
                            Description: rows[i].Description,
                            Categorie: rows[i].Categorie,
                            URL: rows[i].URL
                        }
                    }));
                }
                res.write("]")
                res.write("}")
                res.end();
            }
        });
}

var articlebyprix = function (req, res) {
    co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image ORDER BY Prix ASC",
        function (error, rows) {
            if (!!error) {
                console.log('Requête réussie !\n');
                res.json({ message: "echec de la requête" });
            } else {
                console.log('Requête réussie !\n');
                for (var i = 0; i < rows.length; i++) {
                    res.write(JSON.stringify({
                        Nom: rows[i].Nom,
                        Stock: rows[i].Stock,
                        Prix: rows[i].Prix,
                        Description: rows[i].Description,
                        Categorie: rows[i].Categorie,
                        URL: rows[i].URL,
                    }));
                }
                res.end();
            }
        });
}

var eventpar = function (req, res) {
    nom = req.body.nom;
    prenom = req.body.prenom;
    event = req.body.event;
    if (nom && prenom && event) {
        co.connection.query("INSERT INTO participer (Id_utilisateur,Id_evenements) SELECT Id_utilisateur, Id_evenements FROM utilisateur,evenement WHERE utilisateur.Nom = '" + nom + "' AND utilisateur.Prenom = '" + prenom + "' AND evenement.Nom = '" + event + "'", function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "erreur de la requête" });
            } else {
                console.log('Requête réussie !\n');
                res.json({ message: "tu est bien inscrit" });
            }
        });
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tout les champs !" });
    }
}

var addarticle = function (req, res) {
    var img = '';
    co.connection.beginTransaction(function (error) {
        co.connection.query("SELECT Nom FROM article WHERE Nom = '" + req.body.nom + "'", function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête 1 ');
            } else if (rows[0] != null) {
                console.log('Requête réussie !\n');
                //console.log(rows);
                res.json({ message: "Article deja existante" });
            }
            else {

                co.connection.query("SELECT Id_image FROM Image WHERE URL = '" + req.body.URL + "'", function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête 4 ');
                        co.connection.rollback(function () {
                        });
                    } else if (rows[0] != null) {
                        console.log('Requête réussie');
                        res.json({ message: "Image utilisée sur un autre article" });
                        co.connection.rollback(function () {
                            co.connection.end();
                        });

                    } else {
                        co.connection.query("INSERT INTO image (URL) VALUES ('" + req.body.URL + "');",
                            function (error, rows) {
                                if (!!error) {
                                    console.log('Erreur dans la requête 44 ');
                                    co.connection.rollback(function () {

                                    });
                                }
                            });
                        co.connection.query("SELECT Id_image FROM image WHERE URL = '" + req.body.URL + "'", function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête 45 ');
                                co.connection.rollback(function () {

                                });
                            } else {
                                img = rows[0].Id_image;
                                console.log("LA SI URL")
                            }
                        });
                    }
                    co.connection.query("SELECT Id_Categorie FROM Categorie WHERE Nom = '" + req.body.cat + "'", function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête 3 ');
                            co.connection.rollback(function () {
                            });
                        } else {
                            var cat = rows[0].Id_Categorie;
                        }
                        co.connection.query("INSERT INTO article (Nom,Prix,Description,Id_Categorie,Id_image) VALUES ('" + req.body.nom + "'," + req.body.prix + ",'" + req.body.description + "'," + cat + "," + img + ")",
                            function (error, rows) {
                                if (!!error) {
                                    console.log('Erreur dans la requête 5 ');
                                    co.connection.rollback(function () {

                                    });
                                }
                                co.connection.query("SELECT Id_Article FROM article WHERE Nom = '" + req.body.nom + "'", function (error, rows) {
                                    if (!!error) {
                                        console.log('Erreur dans la requête 6 ');
                                        co.connection.rollback(function () {

                                        });
                                    } else {
                                        var nom = rows[0].Id_Article;
                                    }
                                    co.connection.query("UPDATE image SET Id_Article = " + nom + " WHERE image.Id_image = " + img + "",
                                        function (error, rows) {
                                            if (!!error) {
                                                console.log('Erreur dans la requête 7 ');
                                                co.connection.rollback(function () {

                                                });
                                            }
                                            co.connection.commit(function (error) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 8 ');
                                                    co.connection.rollback(function () {
                                                    });
                                                }
                                                console.log('Requête réussie !\n');
                                                res.json({ message: "Ajout de l'article " + req.body.nom });

                                            });
                                        });
                                });
                            });
                    });

                });
            }
        });
    });
}


var liker = function (req, res) {
    co.connection.beginTransaction(function (error) {
        co.connection.query("SELECT Id_utilisateur FROM utilisateur WHERE Nom = '" + req.body.nom + "' AND prenom = '" + req.body.prenom + "'", function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête 1 ');
                co.connection.rollback(function () {
                });
            } else {
                perso = rows[0].Id_utilisateur;
                co.connection.query("SELECT Id_evenements FROM evenement WHERE Nom = '" + req.body.event + "'", function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête 2 ');
                        co.connection.rollback(function () {

                        });
                    } else {
                        eve = rows[0].Id_evenements;
                        console.log(perso);
                        console.log(eve);
                        co.connection.query("SELECT Aime FROM avis WHERE Id_utilisateur = " + perso + " AND Id_evenements = " + eve + "", function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête 3');
                                co.connection.rollback(function () {

                                });
                            } else if (rows[0] == null) {

                                co.connection.query("INSERT INTO avis (Id_utilisateur,Id_evenements,Aime) VALUES (" + perso + "," + eve + ",1) ", function (error, rows) {
                                    if (!!error) {
                                        console.log('Erreur dans la requête 4 ');
                                        co.connection.rollback(function () {

                                        });
                                    } else {
                                        co.connection.commit(function (error) {
                                            if (!!error) {
                                                console.log('Erreur dans la requête 4.5 ');
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
                                if (rows[0].Aime == 1) {
                                    co.connection.query("UPDATE avis SET Aime = 0 WHERE Id_evenements = " + eve + " AND Id_utilisateur = " + perso + "",
                                        function (error, rows) {
                                            if (!!error) {
                                                console.log('Erreur dans la requête 5 ');
                                                co.connection.rollback(function () {
                                                });
                                            } else {
                                                co.connection.commit(function (error) {
                                                    if (!!error) {
                                                        console.log('Erreur dans la requête 5.5 ');
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
                                    co.connection.query("UPDATE avis SET Aime = 1 WHERE Id_evenements = " + eve + " AND Id_utilisateur = " + perso + "",
                                        function (error, rows) {
                                            if (!!error) {
                                                console.log('Erreur dans la requête 6 ');
                                                co.connection.rollback(function () {
                                                });
                                            } else {
                                                co.connection.commit(function (error) {
                                                    if (!!error) {
                                                        console.log('Erreur dans la requête 6.5 ');
                                                        co.connection.rollback(function () {
                                                        });
                                                    } else {
                                                        console.log('Requête réussie !\n');
                                                        res.json({ message: "Super like" });
                                                    }
                                                });
                                            }
                                        });
                                }
                            }
                        });
                    }
                });
            }
        });
    });
}

var commandes = function (req, res) {
    co.connection.query("SELECT article.Nom, acheter.Quantite FROM `article` INNER JOIN acheter ON article.Id_Article = acheter.Id_Article INNER JOIN commande ON commande.Id_commande = acheter.id_commande INNER JOIN utilisateur On utilisateur.Id_utilisateur = commande.Id_utilisateur WHERE utilisateur.Nom = '" + req.body.nom + "' AND utilisateur.Prenom = '" + req.body.prenom + "' AND commande.Fini = 0",
        function (error, rows) {

            if (!!error) {
                console.log('Erreur dans la requête');
            } else {
                console.log('Requête réussie !\n');
                for (var i = 0; i < rows.length; i++) {
                    res.write(JSON.stringify({
                        Article: rows[i].Nom,
                        Quantite: rows[i].Quantite,
                    }));
                }
                res.end();
            }
        });

}

var eventadd = function (req, res) {
    co.connection.beginTransaction(function (error) {
        co.connection.query("SELECT Nom FROM evenement WHERE Nom = '" + req.body.nom + "'", function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête 1 ');
            } else if (rows[0] != null) {
                console.log('Requête réussie !\n');
                //console.log(rows);
                res.json({ message: "evenement deja existante" });
            } else {
                co.connection.query("INSERT INTO evenement (Nom,Description,Date_debut,Date_fin,Id_Localisation) VALUES ('" + req.body.nom + "','" + req.body.description + "','" + req.body.dated + "','" + req.body.datef + "',(SELECT Id_Localisation FROM localisation WHERE Lieux = '" + req.body.lieux + "'))",
                    function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête 2 ');
                            co.connection.rollback(function () {

                            });
                        } else {
                            co.connection.query("SELECT Id_evenements FROM evenement WHERE Nom = '" + req.body.nom + "'",
                                function (error, rows) {
                                    if (!!error) {
                                        console.log('Erreur dans la requête 3 ');
                                        co.connection.rollback(function () {
                                        });
                                    } else {
                                        var img = rows[0].Id_evenements
                                        co.connection.query("INSERT INTO image (URL,Id_evenements,Image_evenement) VALUES ('" + req.body.URL + "'," + img + ",1) ", function (error, rows) {
                                            if (!!error) {
                                                console.log('Erreur dans la requête 4 ');
                                                co.connection.rollback(function () {

                                                });
                                            } else {
                                                co.connection.commit(function (error) {
                                                    if (!!error) {
                                                        console.log('Erreur dans la requête 5 ');
                                                        co.connection.rollback(function () {
                                                        });
                                                    } else {
                                                        console.log('Requête réussie !\n');
                                                        res.json({ message: "Ajout de l'evenement " + req.body.nom });
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
}

var suprcomm = function (req, res) {
    co.connection.query("SELECT avis.Id_avis,avis.Aime FROM `avis` INNER JOIN evenement ON evenement.Id_evenements = avis.Id_evenements INNER JOIN utilisateur ON avis.Id_utilisateur = utilisateur.Id_utilisateur WHERE utilisateur.Nom = '" + req.body.nom + "' AND utilisateur.Prenom = '" + req.body.prenom + "' AND evenement.nom = '" + req.body.event + "' AND avis.Commentaire = '" + req.body.com + "'",
        function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if (rows[0].Aime == 1) {
                co.connection.query("UPDATE avis SET Commentaire = NULL WHERE Id_avis = " + rows[0].Id_avis + "",
                    function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête 3 ');
                        } else {
                            console.log('Requête réussie !\n');
                            res.json({ message: "Commentaire suprimée" });
                        }
                    });
            } else {
                co.connection.query("DELETE FROM avis WHERE Id_avis = " + rows[0].Id_avis + "",
                    function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête 3 ');
                        } else {
                            console.log('Requête réussie !\n');
                            res.json({ message: "Commentaire suprimée" });
                        }

                    });

            }
        });

}

var suprphoto = function (req, res) {
    co.connection.query("DELETE FROM `image` WHERE URL = '" + req.query.URL + "'",
        function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête ');
            } else {
                console.log('Requête réussie !\n');
                res.json({ message: "photo suprimée" });
            }

        });
}

var filtrecat = function (req, res) {
    co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image ORDER BY article.Id_Categorie ASC",
        function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête  !\n');
                res.json({ message: "echec de la requête" });
            } else {
                console.log('Requête réussie !\n');
                for (var i = 0; i < rows.length; i++) {
                    res.write(JSON.stringify({
                        Nom: rows[i].Nom,
                        Stock: rows[i].Stock,
                        Prix: rows[i].Prix,
                        Description: rows[i].Description,
                        Categorie: rows[i].Categorie,
                        URL: rows[i].URL,
                    }));
                }
                res.end();
            }
        });
}

var panier = function (req, res) {
    var mail = req.body.mail;
    var article = req.body.article;
    var com = "";
    var quantite = req.body.quantite;
    co.connection.beginTransaction(function (error) {
        co.connection.query("SELECT Id_commande FROM commande INNER JOIN utilisateur ON utilisateur.Id_utilisateur = commande.Id_utilisateur WHERE utilisateur.mail = '" + mail + "' AND commande.Fini = 0",
            function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête 1');
                    co.connection.rollback(function () {
                    });
                    res.json({ message: "echec de la requête" });
                } else if (rows[0] == null) {
                    co.connection.query("INSERT INTO commande (Id_utilisateur,Fini) VALUES ((SELECT Id_utilisateur FROM utilisateur WHERE utilisateur.mail = '" + mail + "'),0) ", function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête 2 ');
                            co.connection.rollback(function () {
                            });
                        } else {
                            co.connection.query("SELECT Id_commande FROM commande INNER JOIN utilisateur ON commande.Id_utilisateur = utilisateur.Id_utilisateur WHERE utilisateur.Mail = '" + mail + "' AND commande.fini = 0",
                                function (error, rows) {
                                    if (!!error) {
                                        console.log('Erreur dans la requête 3');
                                    } else {
                                        com = rows[0].Id_commande;
                                        co.connection.query("INSERT INTO acheter (Id_commande,Id_Article) SELECT Id_commande, Id_Article FROM commande,article WHERE article.Nom = '" + article + "' AND commande.Id_commande = " + com + "",
                                            function (error, rows) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 4 ');
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    co.connection.query("UPDATE acheter SET Quantite = " + quantite + " WHERE Id_commande = " + com + "",
                                                        function (error, rows) {
                                                            if (!!error) {
                                                                console.log('Erreur dans la requête 4.5 ');
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
                            } else if (rows[0] == null) {
                                co.connection.query("INSERT INTO acheter (Id_commande,Id_Article,Quantite) VALUES (" + com + ",(SELECT Id_Article FROM article WHERE article.Nom = '" + article + "'), " + quantite + ")",
                                    function (error, rows) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 6 ');
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            co.connection.commit(function (error) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 7 ');
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
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            co.connection.commit(function (error) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 9 ');
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

