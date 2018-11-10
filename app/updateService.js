var cron = require('node-cron');

var User = require('./model/user.model');

var task = null;

exports.startedServer = function() { //  start all map saved on the db

    var range = '0 0,30 * * * *'; // ogni 30 minuti

    if (!cron.validate(range))
        return console.log(range + ' non è un range valido per cron');

    task = cron.schedule(range, function() {
        detect();
    });

    console.log('avviato job cron');
};

exports.d = function() {
    detect();
};

var detect = function() {
    User.find({ maps: { $exists: true, $ne: [] } }, 'maps', function(err, users) {
        if (err)
            return console.log(err);

        users.forEach(function(user) {
            user.maps.forEach(function(map) {
                map.detectors.forEach(function(detector) {
                    var preValue = null;

                    if (detector.temperature.length)
                        preValue = detector.temperature[detector.temperature.length - 1].value;

                    detector.temperature.push({
                        value: fakeDetect(preValue, detector.position)
                    });
                });
            });

            user.save(function(err) {
                if (err)
                    return console.log(err);
                console.log('iterazione di updateservice conclusa con successo');
            });
        });
    });
};

function fakeDetect(preValue, position) {

    if (!preValue)
        return Math.floor(Math.random() * 50) - 10;

    var x = 8;

    if (position == 'indoor')
        x = x / 3;

    var interval = Math.floor(Math.random() * x);
    interval = interval - x / 2;

    var tempValue = preValue + interval;

    if (tempValue > 40 || tempValue < 10)
        tempValue = preValue - interval;
    return tempValue;
};