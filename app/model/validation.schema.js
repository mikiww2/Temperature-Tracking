var Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

//

exports.mapIdSchema = Joi.object({
    mapId: Joi.objectId().required()
});

exports.paramMapSchema = Joi.object({
    name: Joi.string().lowercase().max(20).required()
});

exports.detectorIdSchema = Joi.object({
    mapId: Joi.objectId().required(),
    detectorId: Joi.objectId().required()
});

exports.paramDetectorSchema = Joi.object({
    name: Joi.string().lowercase().max(20).required(),
    position: Joi.string().valid('undefined', 'indoor', 'outdoor')
});

exports.paramStatisticSchema = Joi.object({
    mapId: Joi.objectId().required(),
    detectorId: Joi.objectId(),
    start: Joi.date().less('now'),
    end: Joi.date().less('now')
});