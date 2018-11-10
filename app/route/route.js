//var path = require('path');

// CONTROLLERS

var authenticationM = require('../controller/authenticationManager');
var mapM = require('../controller/mapManager');
var detectorM = require('../controller/detectorManager');
var statisticM = require('../controller/statisticManager');

//

function logoutUser(req) {
    var id = req.session.user.id;
    delete req.session.user;
    console.log('utente sloggato: ' + id);
}

function buildUrl(url, api) {

    if (!url)
        return '/';

    if (api)
        return '/api/' + url;

    return '/' + url;
}

function managePrivateSession(req, res, callback) {
    if (!req.session.user)
        return res.redirect(buildUrl('home'));

    authenticationM.exist(req.session.user.id, function(find) {
        if (find)
            return callback();

        logoutUser(req);

        return res.redirect(buildUrl('home'));
    });
}

//

module.exports = function(app) {

    //////////////////
    // APP ROUTES ///
    ////////////////

    // PUBLIC

    app.get(buildUrl(), function(req, res) {
        return res.redirect(buildUrl('home'));
    });

    app.get(buildUrl('home'), function(req, res) {
        if (req.session.user)
            return res.redirect(buildUrl('gallery'));

        return res.render('login-register', { title: 'Accedi o registrati' });
    });

    // AUTENTICATOR

    app.get(buildUrl('signout'), function(req, res) {
        if (req.session.user)
            logoutUser(req);

        return res.redirect(buildUrl('home'));
    });

    // GALLERY

    app.get(buildUrl('gallery'), function(req, res) {
        managePrivateSession(req, res, function() {

            mapM.getMaps(req, function(err, maps) {
                if (err)
                    return res.status(err.code).send({ error: err.message });

                res.render('gallery', {
                    title: 'Galleria',
                    maps: maps
                });
            });
        });
    });

    // MAP

    app.get(buildUrl('map/:mapId'), function(req, res) {
        managePrivateSession(req, res, function() {
            mapM.getMap(req, function(err, map) {
                if (err || !map)
                    return res.status(err.code).send({ error: err.message });

                return res.render('mapDetail', {
                    title: 'Informazioni mappa',
                    map: map
                });
            });
        });
    });

    // STATISTICS

    app.get(buildUrl('map/:mapId/statistics'), function(req, res) {
        managePrivateSession(req, res, function() {
            statisticM.getStatistic(req, null, function(err, statistics) {
                if (err || !statistics)
                    return res.status(err.code).send({ error: err.message });

                return res.render('statistics', {
                    title: 'Statistiche termometri mappa',
                    statistics: statistics
                });
            });
        });
    });

    //////////////////
    // API ROUTES ///
    ////////////////

    function buildApiUrl(url) {
        return buildUrl(url, true);
    }

    // AUTENTICATOR

    app.post(buildApiUrl('auth/sign_in'), function(req, res) {

        console.log(req.body);

        if (req.session.user)
            return res.redirect(buildUrl('home'));

        authenticationM.signin(req, function(err) {
            if (err)
                return res.render('login-register', {
                    title: 'Accedi o registrati',
                    signIn: err.errorOnSignin,
                    emailIn: err.email,
                    message: err.message
                });

            res.redirect(buildUrl('home'));
        });
    });

    app.post(buildApiUrl('auth/sign_up'), function(req, res) {
        if (req.session.user)
            return res.redirect(buildUrl('home'));

        authenticationM.signup(req, function(err) {
            if (err)
                return res.render('login-register', {
                    title: 'Accedi o registrati',
                    signUp: err.errorOnSignup,
                    emailUp: err.email,
                    name: err.name,
                    message: err.message
                });

            res.redirect(buildUrl('home'));
        });
    });

    //GALLERY

    app.get(buildApiUrl('gallery'), function(req, res) {
        managePrivateSession(req, res, function() {
            mapM.getMaps(req, function(err, maps) {
                if (err)
                    return res.status(err.code).send({ error: err.message });

                res.send({ maps: maps });
            });
        });
    });

    // MAP

    app.post(buildApiUrl('map'), function(req, res) {
        managePrivateSession(req, res, function() {
            mapM.createMap(req, function(err, map) {
                if (err || !map)
                    return res.status(err.code).send({ error: err, redirect: buildUrl('gallery') });

                res.send({ map: map });
            });
        });
    });

    app.get(buildApiUrl('map/:mapId'), function(req, res) {
        managePrivateSession(req, res, function() {
            mapM.getMap(req, function(err, map) {
                if (err || !map)
                    return res.status(err.code).send({ error: err.message, redirect: buildUrl('noMap') });

                res.send({ map: map });
            });
        });
    });

    app.get(buildApiUrl('map/:mapId/delete'), function(req, res) {
        managePrivateSession(req, res, function() {
            mapM.deleteMap(req, function(err, map) {
                if (err || !map)
                    return res.status(err.code).send({ error: err, redirect: buildUrl('gallery') });

                res.send({ map: map });
            });
        });
    });

    app.post(buildApiUrl('map/:mapId/update'), function(req, res) {
        managePrivateSession(req, res, function() {
            mapM.updateMap(req, function(err, map) {
                if (err || !map)
                    return res.status(err.code).send({ error: err, redirect: buildUrl('gallery') });

                res.send({ map: map });
            });
        });
    });

    // DETECTORS

    app.post(buildApiUrl('map/:mapId/detector'), function(req, res) {
        managePrivateSession(req, res, function() {
            detectorM.createDetector(req, function(err, detector) {
                if (err || !detector)
                    return res.status(err.code).send({ error: err, redirect: buildUrl('map/' + req.params.mapId) });

                res.send({ detector: detector });
            });
        });
    });

    app.get(buildApiUrl('map/:mapId/detector/:detectorId'), function(req, res) {
        managePrivateSession(req, res, function() {
            detectorM.getDetector(req, function(err, detector) {
                if (err || !detector)
                    return res.status(err.code).send({ error: err.message, redirect: buildUrl('map/' + req.params.mapId) });

                res.send({ detector: detector });
            });
        });
    });

    app.get(buildApiUrl('map/:mapId/detector/:detectorId/delete'), function(req, res) {
        managePrivateSession(req, res, function() {
            detectorM.deleteDetector(req, function(err, detector) {
                if (err || !detector)
                    return res.status(err.code).send({ error: err, redirect: buildUrl('map/' + req.params.mapId) });

                res.send({ detector: detector });
            });
        });
    });

    app.post(buildApiUrl('map/:mapId/detector/:detectorId/update'), function(req, res) {
        managePrivateSession(req, res, function() {
            detectorM.updateDetector(req, function(err, detector) {
                if (err || !detector)
                    return res.status(err.code).send({ error: err, redirect: buildUrl('map/' + req.params.mapId) });

                res.send({ detector: detector });
            });
        });
    });

    // STATISTICS

    // ERROR 404 e 500

    app.use(function(req, res) {
        var error = new Error();
        error.status = 404;

        res.status(error.status).render('error', {
            title: 'Errore',
            error: error
        });
    });

    app.use(function(err, req, res, next) {
        res.status(err.status || 500).render('error', {
            title: 'Errore',
            error: err
        });
    });

};