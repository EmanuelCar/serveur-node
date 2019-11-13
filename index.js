//Récupérer les requêtes utilisant GET
var get_article = require('./query/get/article.js');
var get_photo = require('./query/get/photo.js');
var get_event = require('./query/get/evenement.js');
var get_autre = require('./query/get/autres.js');

//Récupérer les requêtes utilisant POST
var post_article = require('./query/post/article.js');
var post_event = require('./query/post/evenement.js');
var post_avis = require('./query/post/avis.js');
var post_user = require('./query/post/utilisateur.js');
var post_photo = require('./query/post/photo.js');
var post_panier = require('./query/post/panier.js');

var co = require('./database/bddconnect');

//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

var express = require('express');
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router();

//Vérifier la connection à la BDD
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
    .post(post_user.userinsc)

myRouter.route('/user/connection')          //Se connecter sur le site
    .post(post_user.userco)
//-------------------------------------------------------

//Articles-----------------------------------------------
myRouter.route('/article')                  //Afficher les articles
    .get(get_article.article)

myRouter.route('/article/add')              //Ajouter un article
    .post(post_article.addarticle)

myRouter.route('/article/tri/prix')         //Trier les articles par prix
    .get(get_article.articlebyprix)

myRouter.route('/article/tri/categorie')    //Trier les articles par catégorie
    .get(get_article.filtrecat)

myRouter.route('/article/categorie/add')    //Ajouter une catégorie
    .post(post_article.add)

myRouter.route('/article/best')             //Afficher les 3 articles les plus vendus
    .get(get_article.best3)

myRouter.route('/article/suppr')            //Supprimer un article
    .post(post_article.suprarticle)
//-------------------------------------------------------

//Évènements---------------------------------------------
myRouter.route('/event/add')                //Ajouter un évènement
    .post(post_event.eventadd)

myRouter.route('/event/join')               //Rejoindre un évènement
    .post(post_event.eventpar)

myRouter.route('/event/participant')        //Récupérer les participants sur un évènement
    .get(get_event.participant)  //modif method

myRouter.route('/event/actuel')             //Afficher les évènements non-passés
    .get(get_event.actuevent)     //modif method

myRouter.route('/event/passe')              //Afficher les évènements passés
    .get(get_event.pactuevent)    //modif method
//-------------------------------------------------------

//Avis---------------------------------------------------
myRouter.route('/avis/like')                //Ajouter un "j'aime"
    .post(post_avis.liker)

myRouter.route('/avis/comment/add')         //Ajouter un commentaire
    .post(post_avis.comment)

myRouter.route('/avis/comment/delete')      //Supprimer un commentaire
    .post(post_avis.suprcomm)
//-------------------------------------------------------

//Photos-------------------------------------------------
myRouter.route('/photo/add')                //Ajouter une photo
    .post(post_photo.addphoto)

myRouter.route('/photo/recup')              //Récupérer toutes les photos
    .get(get_photo.recupphoto)    //modif method

myRouter.route('/photo/suppr')              //Supprimer une photo
    .post(post_photo.suprphoto)   //modif method
//-------------------------------------------------------

//Panier-------------------------------------------------
myRouter.route('/panier/add')               //Ajouter au panier
    .post(post_panier.panier)

myRouter.route('/panier/user')              //Afficher le panier
    .post(post_panier.commandes)

myRouter.route('/panier/pass')              //Passer la commande
    .post(post_panier.passcommand)
//-------------------------------------------------------

//Autres-------------------------------------------------
myRouter.route('/statut')                   //Afficher la liste des roles
    .get(get_autre.statut)

myRouter.route('/lieu')                     //Afficher la liste des lieux
    .get(get_autre.lieu)

myRouter.route('/event')                     //Afficher la liste des évènements
    .get(get_autre.event)
//-------------------------------------------------------

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);