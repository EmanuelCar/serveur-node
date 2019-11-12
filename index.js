var express = require('express');
var geting = require('./Get.js');
var metpost = require('./Post.js');

//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

var express = require('express');
var app = express();
var co = require('./bddconnect');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
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
myRouter.route('/panier')
    .post(geting.panier)

myRouter.route('/article/tri')
    .get(geting.articlebyprix)

myRouter.route('/article')
    .get(geting.article)
    .post(geting.addarticle)

myRouter.route('/article/categorie')
    .post(geting.add)
    .get(geting.filtrecat)

myRouter.route('/event')
    .post(geting.eventpar)

myRouter.route('/event/add')
    .post(geting.eventadd)

myRouter.route('/avis/like')
    .post(geting.liker)

myRouter.route('/panier/user')
    .post(geting.commandes)

myRouter.route('/photo/suppr')
    .get(geting.suprphoto)
    .post(geting.suprcomm)

myRouter.route('/statut')
    .post(metpost.statut)

myRouter.route('/user/connection')
    .post(metpost.userco)

myRouter.route('/user/inscription')
    .post(metpost.userinsc)

myRouter.route('/photo/add')
    .post(metpost.addphoto)

myRouter.route('/photo/recup')
    .post(metpost.recupphoto)

myRouter.route('/participant')
    .post(metpost.participant)

myRouter.route('/event/actuel')
    .post(metpost.actuevent)

myRouter.route('/event/passe')
    .post(metpost.pactuevent)

myRouter.route('/avis/comment')
    .post(metpost.comment)

myRouter.route('/article/suppr')
    .post(metpost.suprarticle)

myRouter.route('/passcommand')
    .post(metpost.passcommand)

myRouter.route('/best3')
    .post(metpost.best3)
    
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);