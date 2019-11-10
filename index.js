var express = require('express');
var geting = require('./Get.js');

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

myRouter.route('/articleorder')
    .get(geting.articlebyprix)

myRouter.route('/article')
    .get(geting.article)
    .post(geting.addarticle)

myRouter.route('/article/adcategorie')
    .post(geting.add)

myRouter.route('/event')
    .post(geting.eventpar)
    myRouter.route('/event/add')
    .post(geting.eventadd)
myRouter.route('/like')
    .post(geting.liker)

myRouter.route('/panier/ut')
    .post(geting.commandes)
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);