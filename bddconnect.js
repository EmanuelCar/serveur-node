var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "3308",
    password: "",
    database: "projet_web"
});

module.exports.connection = connection;
