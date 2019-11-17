//création du jeton d'identification avec l'ID de la personne, son statut et sa localisation, il a une durabilité d'1 heure 

var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = '7zfe1e2f4z1deqsfsvfq45ZSDFf565e48f41DFGDZ486312GkzdgiyA8';

module.exports = {
    generateTokenForUser: function (userData) {
        return jwt.sign({
            Id: userData.Id_utilisateur,
            Statut: userData.Roles,
            Lieu: userData.Lieux
        },
            JWT_SIGN_SECRET,
            {
                expiresIn: '1h'
            })
    },

    decodeTokenForUser: function(req, res) {
        var decode = req.headers['authorization'];
        decode = decode.split(" ");
        var marche = jwt.verify(decode[1], JWT_SIGN_SECRET, function(error, decoded) {
            if(error) {
               res.json({message: 'Veuillez vous reconnecter !'});
            } else {
                marche = jwt.decode(decode[1], {complete: true});
                return marche;
            }

        });
        return marche;
       }
       
}