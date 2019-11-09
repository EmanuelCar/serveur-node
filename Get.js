var co = require('./bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


co.connection.connect(function (error) {
    if (error) {
        console.log("Erreur");
    } else {
        console.log("Connecté !");
    }
});

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
                console.log(rows);
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
module.exports = {
    add,
    article,
    addarticle
};


