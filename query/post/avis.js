var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//ajouter un "j'aime"
var liker = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var URL = req.body.URL;
    if (URL && tik) {
        co.connection.beginTransaction(function (error) {
            co.connection.query("SELECT Id_image FROM image WHERE URL = '" + URL + "'", function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête 2 ');
                    res.json({ message: "erreur de la requête" });
                    co.connection.rollback(function () {
                    });
                } else if (rows[0] == null) {
                    console.log('Requête réussie');
                    res.json({ message: "l'image n'existe pas" });
                    co.connection.rollback(function () {
                    });
                } else {
                    img = rows[0].Id_image;
                    co.connection.query("SELECT Aime,Commentaire FROM avis WHERE Id_utilisateur = ? AND Id_image = ?", [tik.payload.Id, img], function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête 3');
                            res.json({ message: "erreur de la requête" });
                            co.connection.rollback(function () {
                            });
                        } else if (rows[0] == null) {
                            co.connection.query("INSERT INTO avis (Id_utilisateur, Id_image, Aime) VALUES (?, ?, 1) ", [tik.payload.Id, img], function (error, rows) {
                                if (!!error) {
                                    console.log('Erreur dans la requête 4 ');
                                    res.json({ message: "erreur de la requête" });
                                    co.connection.rollback(function () {
                                    });
                                } else {
                                    co.connection.commit(function (error) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 4.5 ');
                                            res.json({ message: "erreur de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            console.log('Requête réussie !\n');
                                            res.json({ message: "Super like" });
                                        }
                                    });
                                }
                            });

                        } else {
                            if (rows[0].Aime == 0) {
                                co.connection.query("UPDATE avis SET Aime = 1 WHERE Id_image = ? AND Id_utilisateur = ?", [img, tik.payload.Id],
                                    function (error, rows) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 5 ');
                                            res.json({ message: "erreur de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            co.connection.commit(function (error) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 5.5 ');
                                                    res.json({ message: "erreur de la requête" });
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    console.log('Requête réussie !\n');
                                                    res.json({ message: "Super like" });
                                                }
                                            });
                                        }
                                    });
                            } else if (rows[0].Commentaire == null) {
                                co.connection.query("DELETE FROM avis WHERE Id_image = ? AND Id_utilisateur = ? AND Aime = 1", [img, tik.payload.Id],
                                    function (error, rows) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 5 ');
                                            res.json({ message: "erreur de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            co.connection.commit(function (error) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 5.5 ');
                                                    res.json({ message: "erreur de la requête" });
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    console.log('Requête réussie !\n');
                                                    res.json({ message: "Super unlike" });
                                                }
                                            });
                                        }
                                    });
                            } else {
                                co.connection.query("UPDATE avis SET Aime = 0 WHERE Id_image = ? AND Id_utilisateur = ?", [img, tik.payload.Id],
                                    function (error, rows) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 6 ');
                                            res.json({ message: "erreur de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            co.connection.commit(function (error) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 6.5 ');
                                                    res.json({ message: "erreur de la requête" });
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    console.log('Requête réussie !\n');
                                                    res.json({ message: "Super unlike" });
                                                }
                                            });
                                        }
                                    });
                            }
                        }
                    });
                }
            });
        });

    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

//ajouter un commentaire
var comment = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var URL = req.body.URL;
    var commentaire = req.body.commentaire;
    if (URL && tik) {
        co.connection.beginTransaction(function (error) {
            co.connection.query("SELECT Id_image FROM image WHERE URL = '" + URL + "'", function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête 2 ');
                    res.json({ message: "erreur de la requête" });
                    co.connection.rollback(function () {
                    });
                } else if (rows[0] == null) {
                    console.log('Requête réussie');
                    res.json({ message: "l'image n'existe pas" });
                    co.connection.rollback(function () {
                    });
                } else {
                    img = rows[0].Id_image;
                    co.connection.query("SELECT Aime,Commentaire FROM avis WHERE Id_utilisateur = ? AND Id_image = ?", [tik.payload.Id, img], function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête 3');
                        res.json({ message: "erreur de la requête" });
                        co.connection.rollback(function () {
                        });
                    } else if (rows[0] == null) {
                        console.log(com)
                        co.connection.query("INSERT INTO avis (Id_utilisateur, Id_image, commentaire) VALUES (?, ?, ?) ", [tik.payload.Id, img, commentaire], function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête 4 ');
                                res.json({ message: "erreur de la requête" });
                                co.connection.rollback(function () {
                                });
                            } else {
                                co.connection.commit(function (error) {
                                    if (!!error) {
                                        console.log('Erreur dans la requête 4.5 ');
                                        res.json({ message: "erreur de la requête" });
                                        co.connection.rollback(function () {
                                        });
                                    } else {
                                        console.log('Requête réussie !\n');
                                        res.json({ message: "Commentaire ajouté !" });
                                    }
                                });
                            }
                        });
                    } else {
                    console.log(commentaire)
                        co.connection.query("UPDATE avis SET commentaire = ? WHERE Id_image = ? AND Id_utilisateur = ?", [commentaire, img, tik.payload.Id],
                            function (error, rows) {
                                if (!!error) {
                                    console.log('Erreur dans la requête 5 ');
                                    res.json({ message: "erreur de la requête" });
                                    co.connection.rollback(function () {
                                    });
                                } else {
                                    co.connection.commit(function (error) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 5.5 ');
                                            res.json({ message: "erreur de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            console.log('Requête réussie !\n');
                                            res.json({ message: "message ajouté !" });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });

    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

//Supprimer un commentaire
var suprcomm = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    var nom = req.body.nom;
    var prenom = req.body.prenom;
    var URL = req.body.URL;
    var com = req.body.com;
    if (nom && prenom && URL && com) {
        if (tik.payload.Statut == "membre") {
            co.connection.query("SELECT avis.Id_avis, avis.Aime FROM avis INNER JOIN image ON avis.Id_image = image.Id_image INNER JOIN utilisateur ON avis.Id_utilisateur = utilisateur.Id_utilisateur WHERE utilisateur.Nom = ? AND utilisateur.Prenom = ? AND image.URL = ? AND avis.Commentaire = ?", [nom, prenom, URL, com],
                function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                        res.json({ message: "erreur de la requête" });
                    } else if (rows[0] == null) {
                        console.log('Requête réussie');
                        res.json({ message: "le commentaire n'existe pas" });
                    } else if (rows[0].Aime == 1) {
                        co.connection.query("UPDATE avis SET Commentaire = NULL WHERE Id_avis = " + rows[0].Id_avis + "", function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête 2 ');
                                res.json({ message: "erreur de la requête" });
                            } else {
                                console.log('Requête réussie !\n');
                                res.json({ message: "Commentaire supprimé" });
                            }
                        });
                    } else {
                        co.connection.query("DELETE FROM avis WHERE Id_avis = " + rows[0].Id_avis + "", function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête 3 ');
                                res.json({ message: "erreur de la requête" });
                            } else {
                                console.log('Requête réussie !\n');
                                res.json({ message: "Commentaire supprimé" });
                            }
                        });
                    }
                });
        } else {
            console.log('access denied ');
            res.json({ message: "Vous n'avez pas les droits pour effectuer cette action !" });
        }
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

module.exports = {
    liker,
    comment,
    suprcomm
};