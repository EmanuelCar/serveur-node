var express = require('express');
var couu = require('./coeur/connexion');

//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

var express = require('express');
var app = express();
var co = require('./bddconnect');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router();

co.connection.connect(function (error) {
    if (!!error) {
        console.log("Erreur");
    } else {
        console.log("Connecté !");
    }
});

// Démarrer le serveur 
app.listen(port, function () {
    console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port);
});

// Nous permet de récupérer les statuts
myRouter.route('/bdd')
        .post(couu.x)

    .get(function (req, res) {
        co.connection.query("SELECT "+ req.query.col +" FROM statut", function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else {
                console.log('Requête réussie !');
                numRows = rows.length;
                for(var i=0; i < numRows; i++) {
                    res.write(JSON.stringify({
                        id : rows[i].Id_Statut, 
                        Roles : rows[i].Roles,
                    }));
                }
                res.end();
            } 
        });
    });

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);