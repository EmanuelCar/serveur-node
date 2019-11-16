var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "3308",
    password: "mdpintrouvable",
    database: "projet_webv2"
});

module.exports.connection = connection;
