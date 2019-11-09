var co = require('../bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var x = function (req, res) {
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

module.exports.x = x;
