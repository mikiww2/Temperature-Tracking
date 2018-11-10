var Joi = require('joi');

var User = require('../model/user.model');

var schema = require('../model/validation.schema');

//

function prepareDetector(detector) {
    var temperature = [];

    detector.temperature.forEach(function(survey) {
        temperature.push({
            date: survey._id,
            value: survey.value
        });
    });

    return {
        id: detector._id,
        name: detector.name,
        position: detector.position,
        temperature: temperature
    };
}

//

exports.getDetector = function(req, callback) {
    Joi.validate(req.params, schema.detectorIdSchema, function(err) {
        if (err)
            return callback({ code: 400, message: err.details[0].message }, null);

        // retrieve map

        User.findById(req.session.user.id, 'maps', function(err, user) {
            if (err || !user)
                return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

            if (!user.maps)
                return callback({ code: 404, message: 'La  mappa non esiste' }, null);

            var map = user.maps.id(req.params.mapId);

            if (!map)
                return callback({ code: 404, message: 'La mappa non esiste' }, null);

            var detector = map.id(req.params.detectorId);

            if (!detector)
                return callback({ code: 404, message: 'Il rilevatore non esiste' }, null);

            return callback(null, prepareDetector(detector));
        });
    });
};

exports.deleteDetector = function(req, callback) {
    Joi.validate(req.params, schema.detectorIdSchema, function(err) {
        if (err)
            return callback({ code: 400, message: err.details[0].message }, null);

        // retrieve map

        User.findById(req.session.user.id, 'maps', function(err, user) {
            if (err || !user)
                return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

            if (!user.maps)
                return callback({ code: 404, message: 'La  mappa non esiste' }, null);

            var map = user.maps.id(req.params.mapId);

            if (!map)
                return callback({ code: 404, message: 'La mappa non esiste' }, null);

            var detector = map.detectors.id(req.params.detectorId).remove();

            if (!detector)
                return callback({ code: 404, message: 'Il rilevatore non esiste' }, null);

            user.save(function(err) {
                if (err)
                    return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

                console.log('eliminato il rilevatore ' + req.params.detectorId + ' della mappa ' + req.params.mapId + ' dell\'utente ' + req.session.user.id);

                return callback(null, prepareDetector(detector));
            });
        });
    });
};

exports.createDetector = function(req, callback) {
    Joi.validate(req.params, schema.mapIdSchema, function(err) {
        if (err)
            return callback({ code: 400, message: err.details[0].message }, null);

        Joi.validate(req.body, schema.paramDetectorSchema, function(err) {
            if (err)
                return callback({ code: 400, message: err.details[0].message }, null);

            // retrieve map

            User.findById(req.session.user.id, 'maps', function(err, user) {
                if (err || !user)
                    return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

                if (!user.maps)
                    return callback({ code: 404, message: 'La  mappa non esiste' }, null);

                var map = user.maps.id(req.params.mapId);

                if (!map)
                    return callback({ code: 404, message: 'La mappa non esiste' }, null);

                var detector = { name: req.body.name };

                if (req.body.position)
                    detector.position = req.body.position;

                map.detectors.push(detector);

                detector = map.detectors[map.detectors.length - 1];
                detector.isNew;

                user.save(function(err) {
                    if (err)
                        return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

                    console.log('creato il rilevatore ' + detector._id + ' della mappa ' + req.params.mapId + ' dell\'utente ' + req.session.user.id);

                    return callback(null, prepareDetector(detector));
                });
            });
        });
    });
};

exports.updateDetector = function(req, callback) {
    Joi.validate(req.params, schema.detectorIdSchema, function(err) {
        if (err)
            return callback({ code: 400, message: err.details[0].message }, null);

        Joi.validate(req.body, schema.paramDetectorSchema, function(err) {
            if (err)
                return callback({ code: 400, message: err.details[0].message }, null);

            // retrieve map

            User.findById(req.session.user.id, 'maps', function(err, user) {
                if (err || !user)
                    return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

                if (!user.maps)
                    return callback({ code: 404, message: 'La  mappa non esiste' }, null);

                var map = user.maps.id(req.params.mapId);

                if (!map)
                    return callback({ code: 404, message: 'La mappa non esiste' }, null);

                console.log(map);

                var detector = map.detectors.id(req.params.detectorId);

                if (!detector)
                    return callback({ code: 404, message: 'Il rilevatore non esiste' }, null);


                if (req.body.name)
                    detector.name = req.body.name;

                if (req.body.position)
                    detector.position = req.body.position;

                user.save(function(err) {
                    if (err)
                        return callback({ code: 500, message: 'Errore imprevisto del server' }, null);

                    console.log('aggiornato il rilevatore ' + req.params.detectorId + ' della mappa ' + req.params.mapId + ' dell\'utente ' + req.session.user.id);

                    return callback(null, prepareDetector(detector));
                });
            });
        });
    });
};