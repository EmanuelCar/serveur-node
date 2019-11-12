var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = '7zfe1e2f4z1deqsfsvfq45ZSDFf565e48f41DFGDZ486312GkzdgiyA8';

module.exports = {
    generateTokenForUser: function (userData) {
        return jwt.sign({
            Id: userData.Id_utilisateur,
            Statut: userData.Roles
        },
            JWT_SIGN_SECRET,
            {
                expiresIn: '1h'
            })
    }
}