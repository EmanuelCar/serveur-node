//Connexion à la bdd

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "",
    password: "mdpintrouvable",
    database: "projet_web_v2"
});

module.exports.connection = connection;
