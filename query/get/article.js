var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Récupérer la liste des articles en fonction du lieu de l'utilisateur
var article = function (req, res) {
    var lieux = req.query.lieux;
    if (lieux) {
        co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN Localisation ON Localisation.Id_Localisation = Provenir.Id_Localisation WHERE Localisation.Lieux = '" + lieux + "'",
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

//trier les articles par prix
var articlebyprix = function (req, res) {
    var lieux = req.query.lieux;
    if (lieux) {
        co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN Localisation ON Localisation.Id_Localisation = Provenir.Id_Localisation WHERE Localisation.Lieux = '" + lieux + "' ORDER BY Prix ASC",
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

//Filtrer les articles par catégorie
var filtrecat = function (req, res) {
    var lieux = req.query.lieux;
    if (lieux) {
        co.connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image INNER JOIN provenir ON provenir.Id_article = article.Id_article INNER JOIN Localisation ON Localisation.Id_Localisation = Provenir.Id_Localisation WHERE Localisation.Lieux = '" + lieux + "' ORDER BY Categorie ASC",
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

module.exports = {
    article,
    articlebyprix,
    filtrecat
};