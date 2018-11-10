var Joi = require('joi');

var User = require('../model/user.model');

var schema = require('../model/validation.schema');

var last = 8;

//

function prepareMap(map, extend) {
    var temp = {
        id: map._id,
        name: map.name,
        nDetectors: map.detectors.length || 0
    };

    if (extend) {
        temp.detectors = [];
        map.detectors.forEach(function(detector) {
            var temperature = [];

            detector.temperature.forEach(function(survey) {
                temperature.push({
                    date: survey._id.toISOString().slice(0, 16).replace(/-/g, ' ').replace('T', ' '),
                    value: survey.value.toString().slice(0, 4)
                });
            });

            var o = temperature.length - last;

            if (o)
                temperature.splice(0, o);

            temp.detectors.push({
                id: detector._id,
                name: detector.name,
                position: detector.position,
                temperature: temperature
            });
        });
    }
    return temp;
}

//

exports.getMaps = function(req, callback) {
    User.findById(req.session.user.id, 'maps', function(err, user) {
        if (err || !user)
            return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

        if (!user.maps || !user.maps.length)
            return callback(null, []);

        var maps = [];
        user.maps.forEach(function(map) {
            maps.push(prepareMap(map, false));
        });

        callback(null, maps);
    });
};

exports.getMap = function(req, callback) {
    Joi.validate(req.params, schema.mapIdSchema, function(err) {
        if (err)
            return callback({ code: 400, message: err.details[0].message }, null);

        User.findById(req.session.user.id, 'maps', function(err, user) {
            if (err || !user)
                return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

            if (!user.maps)
                return callback({ code: 404, message: 'La  mappa non esiste' }, null);

            var map = user.maps.id(req.params.mapId);

            if (!map)
                return callback({ code: 404, message: 'La mappa non esiste' }, null);

            return callback(null, prepareMap(map, true));
        });
    });
};

exports.deleteMap = function(req, callback) {
    Joi.validate(req.params, schema.mapIdSchema, function(err) {
        if (err)
            return callback({ code: 400, message: err.details[0].message }, null);

        User.findById(req.session.user.id, 'maps', function(err, user) {
            if (err || !user)
                return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

            if (!user.maps)
                return callback({ code: 404, message: 'La  mappa non esiste' }, null);

            var map = user.maps.id(req.params.mapId).remove();

            if (!map)
                return callback({ code: 404, message: 'La mappa non esiste' }, null);

            user.save(function(err) {
                if (err)
                    return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

                console.log('eliminata la mappa : ' + req.params.mapId + ' dell\'utente ' + req.session.user.id);

                return callback(null, prepareMap(map, true));
            });
        });
    });
};

exports.createMap = function(req, callback) {
    Joi.validate(req.body, schema.paramMapSchema, function(err) {
        if (err)
            return callback({ code: 400, message: err.details[0].message }, null);

        User.findById(req.session.user.id, 'maps', function(err, user) {
            if (err || !user)
                return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

            if (!user.maps)
                user.maps = [];

            user.maps.push({
                name: req.body.name
            });

            var map = user.maps[user.maps.length - 1];

            map.isNew;
            user.save(function(err) {
                if (err)
                    return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

                console.log('creata la mappa : ' + map._id + ' dell\'utente ' + req.session.user.id);

                return callback(null, prepareMap(map, true)); // TODO: pulire object dalle cose extra
            });
        });
    });
};

exports.updateMap = function(req, callback) {
    Joi.validate(req.params, schema.mapIdSchema, function(err) {
        if (err)
            return callback({ code: 400, message: err.details[0].message }, null);

        Joi.validate(req.body, schema.paramMapSchema, function(err) {
            if (err)
                return callback({ code: 400, message: err.details[0].message }, null);

            User.findById(req.session.user.id, 'maps', function(err, user) {
                if (err || !user)
                    return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

                if (!user.maps)
                    return callback({ code: 404, message: 'La  mappa non esiste' }, null);

                var map = user.maps.id(req.params.mapId);

                if (!map)
                    return callback({ code: 404, message: 'La mappa non esiste' }, null);


                if (req.body.name)
                    map.name = req.body.name;

                user.save(function(err) {
                    if (err)
                        return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

                    console.log('aggiornata la mappa : ' + req.params.mapId + ' dell\'utente ' + req.session.user.id);

                    return callback(null, prepareMap(map, true)); // TODO: pulire object dalle cose extra
                });

            });
        });
    });
};