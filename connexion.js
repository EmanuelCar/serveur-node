var express = require('express');
var mysql = require('mysql');
var app = express();

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "projet_web"
});

connection.connect(function (error) {
    if (!!error){
    console.log("Erreur");
    } else {
        console.log("Connecté !");
    }
});

app.get('/', function(req, resp){
    connection.query("SELECT * FROM utilisateurs", function(error, rows, fields){
        if(!!error) {
            console.log('Erreur dans la requête');
        } else {
            console.log('Requête réussie !');
        }
    });
})

app.listen(1337);
