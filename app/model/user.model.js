var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//

var temperatureSchema = new Schema({
    _id: {
        type: Date,
        default: Date.now
    },
    value: {
        type: Number,
        required: true
    }
});

var detectorSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    position: {
        type: String,
        default: 'undefined',
        enum: ['undefined', 'indoor', 'outdoor']
    },
    temperature: {
        type: [temperatureSchema],
        default: []
    }
});

var mapSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    detectors: {
        type: [detectorSchema],
        default: []
    }
});

var userSchema = new Schema({
    _id: { // email
        type: String,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Inserisci un\'email valida']
    },
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'la password è obbligatoria']
    },
    maps: {
        type: [mapSchema],
        default: []
    }
});

//get mail
userSchema.methods.getMail = function() {
    return this._id;
};

//check user password
userSchema.methods.checkPassword = function(password) {
    return password == this.password;
};

//export
module.exports = mongoose.model('User', userSchema);