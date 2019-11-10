var co = require('./bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var add = function (req, res) {
    co.connection.query("SELECT Nom FROM categorie WHERE Nom = '" + req.body.cat + "'", function (error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête 1 ');
        } else if (rows[0] != null) {
            console.log('Requête réussie !\n');
            //console.log(rows);
            res.json({ message: "Categorie deja existante" });
        }
        else {
            co.connection.query("INSERT INTO categorie (Nom) VALUES ('" + req.body.cat + "');",
                function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête 2 ');
                    } else {
                        console.log('Requête réussie !\n');
                        res.json({ message: "Ajout de la categorie d'article " + req.body.cat });

                    }

                });
        }
    });
}

var article = function (req, res) {
    co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image",
        function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
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

var articlebyprix = function (req, res) {
    co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image ORDER BY Prix ASC",
        function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
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
    co.connection.query("INSERT INTO participer (Id_utilisateur,Id_evenements) SELECT Id_utilisateur, Id_evenements FROM utilisateur,evenement WHERE utilisateur.Nom = '" + req.body.nom + "' AND utilisateur.Prenom = '" + req.body.prenom + "' AND evenement.Nom = '" + req.body.event + "'", function (error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête');
            res.json({ message: "tu est déjà inscrit" });
        } else {
            console.log('Requête réussie !\n');
            //console.log(rows);
            res.json({ message: "tu est bien inscrit" });
        }
    });
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
        co.connection.query("SELECT Id_utilisateur FROM utilisateur WHERE Nom = '" + req.body.nom + "' AND prenom = '"+ req.body.prenom +"'", function (error, rows) {
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

module.exports = {
    add,
    article,
    addarticle,
    eventpar,
    articlebyprix,
    liker,
    commandes
};

