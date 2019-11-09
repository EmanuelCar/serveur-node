var co = require('../bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var statut = function (req, res) {
    co.connection.query("SELECT "+ req.body.col +" FROM statut", function (error, rows) {
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
}

var users = function (req, res) {
    var mail = req.body.mail;
	var password = req.body.password;
	if (mail && password) {
		co.connection.query("SELECT * FROM utilisateur INNER JOIN statut ON utilisateur.Id_Statut = statut.Id_Statut INNER JOIN localisation ON utilisateur.Id_Localisation = localisation.Id_Localisation WHERE Mail = ? AND Password = ?", [mail, password], function(error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
            } else if (rows.length > 0) {
                console.log('Requête réussie !');
				//req.session.loggedin = true;
                //req.session.mail = mail;
                res.json({ message : "Bienvenu " + rows[0].Prenom + " " + rows[0].Nom + " !" + ", vous êtes " + rows[0].Roles + ", vous vous trouvez à " + rows[0].Lieux})
				//res.redirect('/home');
			} else {
                console.log('Requête réussie !');
				res.send('Mail ou Mot de passe incorrect !');
			}			
			res.end();
		});
	} else {
		res.send('Veuillez entrer votre mail et votre mot de passe !');
		res.end();
	}
}

module.exports = {
    statut, 
    users
};