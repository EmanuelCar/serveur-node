var express = require('express');
var get_article = require('./query/get/article.js');
var get_photo = require('./query/get/photo.js');
var get_event = require('./query/get/evenement.js');
var metpost = require('./Post.js');

//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

var express = require('express');
var app = express();
var co = require('./database/bddconnect');

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

//Les routes :

//Utilisateurs-------------------------------------------
myRouter.route('/user/inscription')         //S'inscrire sur le site
    .post(metpost.userinsc)

myRouter.route('/user/connection')          //Se connecter sur le site
    .post(metpost.userco)
//-------------------------------------------------------

//Articles-----------------------------------------------
myRouter.route('/article')                  //Afficher les articles
    .get(get_article.article)

myRouter.route('/article/add')              //Ajouter un article
    .post(geting.addarticle)

myRouter.route('/article/tri/prix')         //Trier les articles par prix
    .get(get_article.articlebyprix)

myRouter.route('/article/tri/categorie')    //Trier les articles par catégorie
    .get(get_article.filtrecat)

myRouter.route('/article/categorie/add')    //Ajouter une catégorie
    .post(geting.add)

myRouter.route('/article/best')             //Afficher les 3 articles les plus vendus
    .post(metpost.best3)

myRouter.route('/article/suppr')            //Supprimer un article
    .post(metpost.suprarticle)
//-------------------------------------------------------

//Évènements---------------------------------------------
myRouter.route('/event/add')                //Ajouter un évènement
    .post(geting.eventadd)

myRouter.route('/event/join')               //Rejoindre un évènement
    .post(geting.eventpar)

myRouter.route('/event/participant')        //Récupérer les participants sur un évènement
    .get(get_event.participant)  //modif method

myRouter.route('/event/actuel')             //Afficher les évènements non-passés
    .get(get_event.actuevent)     //modif method

myRouter.route('/event/passe')              //Afficher les évènements passés
    .get(get_event.pactuevent)    //modif method
//-------------------------------------------------------

//Avis---------------------------------------------------
myRouter.route('/avis/like')                //Ajouter un "j'aime"
    .post(geting.liker)

myRouter.route('/avis/comment/add')         //Ajouter un commentaire
    .post(metpost.comment)

myRouter.route('/avis/comment/delete')      //Supprimer un commentaire
    .post(geting.suprcomm)
//-------------------------------------------------------

//Photos-------------------------------------------------
myRouter.route('/photo/add')                //Ajouter une photo
    .post(metpost.addphoto)

myRouter.route('/photo/recup')              //Récupérer toutes les photos
    .get(get_photo.recupphoto) //modif method

myRouter.route('/photo/suppr')              //Supprimer une photo
    .post(geting.suprphoto)   //modif method
//-------------------------------------------------------

//Panier-------------------------------------------------
myRouter.route('/panier/add')               //Ajouter au panier
    .post(geting.panier)

myRouter.route('/panier/user')              //Afficher le panier
    .post(geting.commandes)

myRouter.route('/panier/pass')              //Passer la commande
    .post(metpost.passcommand)
//-------------------------------------------------------

myRouter.route('/statut')                   //Afficher les roles
    .get(metpost.statut)

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);