var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Récupérer la liste des articles en fonction du lieu de l'utilisateur
var article = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN Localisation ON Localisation.Id_Localisation = Provenir.Id_Localisation WHERE Localisation.Lieux = ?", [tik.payload.Lieu],
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
                    res.json({ articles,
                               message: "Récupération des articles réussi"
                    });
                }
            });
    } else {
        console.log('Erreur dans la requête ');
        res.json({ message: "Veuillez remplir le lieu !" });
    }
}

//trier les articles par prix
var articlebyprix = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN Localisation ON Localisation.Id_Localisation = Provenir.Id_Localisation WHERE Localisation.Lieux = ? ORDER BY Prix ASC", [tik.payload.Lieu],
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
                    res.json({ articles,
                               message: "Le tri par prix est effectif"
                    });
                }
            });
    } else {
        console.log('Erreur dans la requête ');
        res.json({ message: "Veuillez remplir le lieu !" });
    }
}

//Filtrer les articles par catégorie
var filtrecat = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN Localisation ON Localisation.Id_Localisation = Provenir.Id_Localisation WHERE Localisation.Lieux = ? ORDER BY Categorie ASC", [tik.payload.Lieu],
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
                    res.json({ 
                        articles,
                        message: "Le tri par catégorie est effectif"
                    });
                }
            });
    } else {
        console.log('Erreur dans la requête ');
        res.json({ message: "Veuillez remplir le lieu !" });
    }
}

//Afficher les 3 articles les plus vendus en fonction de la localisation de l'étudiant
var best3 = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT Lieux FROM localisation WHERE Lieux = ?", [tik.payload.Lieu], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else if (rows.length == 0) {
                res.json({ message: "Veuillez sélectionner une localisation valide !" })
            } else {
                co.connection.query("SELECT article.Nom, SUM(Quantite) AS Quantité_totale, image.URL FROM acheter INNER JOIN article ON acheter.Id_Article = article.Id_Article INNER JOIN image ON article.Id_image = image.Id_image INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN localisation ON localisation.Id_Localisation = provenir.Id_Localisation INNER JOIN commande ON acheter.Id_commande = commande.Id_commande WHERE commande.Fini = TRUE AND localisation.Lieux = ? GROUP BY article.Nom ORDER BY Quantité_totale DESC LIMIT 3", [tik.payload.Lieu], function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                        res.json({ message: "Erreur dans la requête !" });
                    } else if (rows.length == 0) {
                        res.json({ message: "Il n'y a pas encore d'articles commandé dans cette ville !" })
                    } else if (rows.length == 1) {
                        res.json({
                            "Article 1":
                            {
                                "Nom": rows[0].Nom,
                                "Quantité": rows[0].Quantité_totale,
                                "URL": rows[0].URL
                            },
                            message: "Affichage du meilleur article"
                        })
                    } else if (rows.length == 2) {
                        res.json({
                            "Article 1":
                            {
                                "Nom": rows[0].Nom,
                                "Quantité": rows[0].Quantité_totale,
                                "URL": rows[0].URL
                            },
                            "Article 2":
                            {
                                "Nom": rows[1].Nom,
                                "Quantité": rows[1].Quantité_totale,
                                "URL": rows[1].URL
                            },
                            message: "Affichage des 2 meilleurs articles"
                        })
                    } else {
                        res.json({
                            "Article 1":
                            {
                                "Nom": rows[0].Nom,
                                "Quantité": rows[0].Quantité_totale,
                                "URL": rows[0].URL
                            },
                            "Article 2":
                            {
                                "Nom": rows[1].Nom,
                                "Quantité": rows[1].Quantité_totale,
                                "URL": rows[1].URL
                            },
                            "Article 3":
                            {
                                "Nom": rows[2].Nom,
                                "Quantité": rows[2].Quantité_totale,
                                "URL": rows[2].URL
                            },
                            message: "Affichage des 3 meilleurs articles"
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
    article,
    articlebyprix,
    filtrecat,
    best3
};