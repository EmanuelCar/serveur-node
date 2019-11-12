var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "",
    password: "",
    database: "projet_web"
});

module.exports.connection = connection;
