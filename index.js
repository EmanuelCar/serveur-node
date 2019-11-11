var express = require('express');
var metpost = require('./coeur/postmethod');

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
myRouter.route('/statut')
    .post(metpost.statut)

myRouter.route('/user/connection')
    .post(metpost.userco)

myRouter.route('/user/inscription')
    .post(metpost.userinsc)

myRouter.route('/addphoto')
    .post(metpost.addphoto)

myRouter.route('/recupphoto')
    .post(metpost.recupphoto)

myRouter.route('/participant')
    .post(metpost.participant)

myRouter.route('/actuevent')
    .post(metpost.actuevent)

myRouter.route('/comment')
    .post(metpost.comment)

/*myRouter.route('/tricat')
    .post(metpost.tricat)*/
    
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);