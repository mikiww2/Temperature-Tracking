var Joi = require('joi');

var User = require('../model/user.model');

//

function loadInfo(from, to) {
    to.user = {};
    to.user.id = from._id;
    to.user.name = from.name;

    console.log(to.user);
}

//

exports.exist = function(id, callback) {
    User.findById(id, 'name', function(err, user) {
        if (err || !user)
            return callback(false);
        callback(true);
    });
};

exports.signin = function(req, callback) {

    req.body.email = req.body.email.toLowerCase();

    // VALIDATION

    var schema = {
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(6).max(12).required()
    };

    var result = Joi.validate(req.body, schema);

    if (result.error)
        return callback({
            errorOnSignin: true,
            email: req.body.email,
            message: result.error.details[0].message
        });

    //

    var email = req.body.email;
    var pass = req.body.password;

    User.findById(email, function(err, user) {
        if (err) {
            console.log('errore: ' + err);
            return callback({
                errorOnSignin: true,
                email: req.body.email,
                message: 'Errore imprevisto del server'
            });
        }

        // SE NON TROVA UN UTENTE NEL DATABASE

        if (!user) {
            console.log('Non è stato individuato nessun utente con email ' + email);
            return callback({
                errorOnSignin: true,
                email: req.body.email,
                message: 'L\'indirizzo email o la password sono errate!'
            });
        }

        // SE TROVA UN UTENTE NEL DB

        // SE LA PASSWORD NON CORRISPONDE

        if (!user.checkPassword(pass)) {
            console.log('L\'indirizzo email o la password sono errate!');
            return callback({
                errorOnSignin: true,
                email: req.body.email,
                message: 'L\'indirizzo email o la password sono errate!'
            });
        }

        // SE LA PASSWORD CORRISPONDE

        console.log('Trovato utente ' + user._id + ' con password corretta');

        loadInfo(user, req.session);

        console.log('Autenticato con successo!');
        callback(false);
    });
};

exports.signup = function(req, callback) {

    req.body.name = req.body.name.toLowerCase();
    req.body.email = req.body.email.toLowerCase();

    // VALIDATION

    var schema = {
        name: Joi.string().min(2).lowercase().required(),
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(6).max(12).required(),
        password2: Joi.valid(Joi.ref('password')).required()
    };

    var result = Joi.validate(req.body, schema);

    if (result.error)
        return callback({
            errorOnSignup: true,
            email: req.body.email,
            name: req.body.name,
            message: result.error.details[0].message
        });

    //

    var email = req.body.email;

    User.findById(email, function(err, user) {
        if (err) {
            console.log('errore: ' + err);
            return callback({
                errorOnSignup: true,
                email: req.body.email,
                name: req.body.name,
                message: 'Errore imprevisto del server'
            });
        }

        // SE LA EMAIL è GIA PRESENTE NEL DB

        if (user) {
            console.log('user gia esistente: ' + user._id);
            return callback({
                errorOnSignup: true,
                email: req.body.email,
                name: req.body.name,
                message: 'L\'indirizzo email esiste già!'
            });
        }

        // SE LA EMAIL NON è PRESENTE NEL DB

        console.log('account disponibile per ' + email);
        new User({
            _id: req.body.email,
            name: req.body.name,
            password: req.body.password
        }).save(function(err, user) {
            if (err) {
                console.log('errore nel salvataggio utente, ' + err);
                return callback({
                    errorOnSignup: true,
                    email: req.body.email,
                    name: req.body.name,
                    message: 'Errore imprevisto nel salvataggio dell\'utente'
                });
            }

            // SE IL SALVATAGGIO è RIUSCITO

            console.log('salvato utente: ' + user._id);

            loadInfo(user, req.session); // LOGIN AUTOMATICO

            callback(false);
        });
    });
};