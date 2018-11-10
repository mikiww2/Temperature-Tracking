var Joi = require('joi');

var User = require('../model/user.model');

var schema = require('../model/validation.schema');

//

//function prepareStatistic(statistic) {};

//

exports.getStatistic = function(req, options, callback) {
    if (!options) {
        Joi.validate(req.params, schema.mapIdSchema, function(err) {
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

                var temp = [];

                map.detectors.forEach(function(detector) {
                    var d = {};
                    d.name = detector.name;
                    d.position = detector.position;
                    d.temperature = [];

                    detector.temperature.forEach(function(e) {
                        d.temperature.push({
                            date: e._id.toISOString().slice(0, 16).replace(/-/g, ' ').replace('T', ' '),
                            value: e.value.toString().slice(0, 4)
                        });
                    });

                    temp.push(d);
                });

                return callback(null, temp);
            });
        });
    }
};