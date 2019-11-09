

//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

var express = require('express');
var mysql = require('mysql');
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router();

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "3308",
    password: "",
    database: "projet_web"
});

connection.connect(function (error) {
    if (!!error) {
        console.log("Erreur");
    } else {
        console.log("Connecté !");
    }
});

// Je vous rappelle notre route (/piscines).  
myRouter.route('/')
    // all permet de prendre en charge toutes les méthodes. 
    .all(function (req, res) {
        res.json({ message: "Bienvenue sur notre Frugal API ", methode: req.method });
    });

myRouter.route('/piscines')
    // J'implémente les méthodes GET, PUT, UPDATE et DELETE
    // GET
    .get(function (req, res) {
        res.json({
            message: "Liste les piscines de Lille Métropole avec paramètres :",
            ville: req.query.ville,
            nbResultat: req.query.maxresultat,
            methode: req.method
        });
    })
    //POST
    .post(function (req, res) {
        res.json({
            message: "Ajoute une nouvelle piscine à la liste",
            nom: req.body.nom,
            ville: req.body.ville,
            taille: req.body.taille,
            methode: req.method
        });
    })
    //PUT
    .put(function (req, res) {
        res.json({ message: "Mise à jour des informations d'une piscine dans la liste", methode: req.method });
    })
    //DELETE
    .delete(function (req, res) {
        res.json({ message: "Suppression d'une piscine dans la liste", methode: req.method });
    });

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);

// Démarrer le serveur 
app.listen(port, function () {
    console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port);
});

myRouter.route('/piscines/:piscine_id')
    .get(function (req, res) {
        res.json({ message: "Vous souhaitez accéder aux informations de la piscine n°" + req.params.piscine_id });
    })
    .put(function (req, res) {
        res.json({ message: "Vous souhaitez modifier les informations de la piscine n°" + req.params.piscine_id });
    })
    .delete(function (req, res) {
        res.json({ message: "Vous souhaitez supprimer la piscine n°" + req.params.piscine_id });
    });

myRouter.get('/bdd', function (req, res) {
    connection.query("SELECT " + req.query.col + " FROM statut", function (error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête');
        } else {
            console.log('Requête réussie !\n');
            //console.log(rows);
            for (var i = 0; i < rows.length; i++) {
                res.write(JSON.stringify({
                    id: rows[i].Id_Statut,
                    Roles: rows[i].Roles,
                }));
            }
            res.end();
        }
    });
})


myRouter.get('/article', function (req, res) {
    connection.query("SELECT article.Nom,Stock,Prix,Description,categorie.Nom as Categorie,image.URL FROM `article` INNER JOIN categorie ON article.ID_Categorie = categorie.Id_Categorie INNER JOIN image ON image.Id_image = article.ID_image",
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

})

myRouter.post('/article/adcategorie', function (req, res) {
    connection.query("SELECT Nom FROM categorie WHERE Nom = '" + req.body.cat + "'", function (error, rows) {
        if (!!error) {
            console.log('Erreur dans la requête 1 ');
        } else if (rows[0] != null) {
            console.log('Requête réussie !\n');
            //console.log(rows);
            res.json({ message: "Categorie deja existante" });
        }
        else {
            connection.query("INSERT INTO categorie (Id_Categorie, Nom) VALUES (NULL,'" + req.body.cat + "');",
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
})