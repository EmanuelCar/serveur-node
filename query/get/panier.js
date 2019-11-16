var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Afficher le panier
var commandes = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        co.connection.query("SELECT article.Nom, acheter.Quantite, image.URL FROM `article` INNER JOIN acheter ON article.Id_Article = acheter.Id_Article INNER JOIN commande ON commande.Id_commande = acheter.id_commande INNER JOIN utilisateur On utilisateur.Id_utilisateur = commande.Id_utilisateur INNER JOIN image ON article.Id_image = image.Id_image WHERE utilisateur.Id_utilisateur = ? AND commande.Fini = 0", [tik.payload.Id],
            function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête');
                    res.json({ message: "erreur de la requête" });
                } else {
                    const commande = rows.map((row) => ({
                        Article: row.Nom,
                        Quantite: row.Quantite,
                        URL: row.URL,
                    }))
                    res.json({ commande,
                        message: "Affichage du panier"
                      });
                }
            });
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

module.exports = {
    commandes
};