var express = require('express');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');
var morgan = require('morgan');
var session = require('express-session');
var path = require('path');
var b_parser = require('body-parser');

// LOAD CONFIGURATIONS

var database = require('./config/database');
var server = require('./config/server');

var updateService = require('./app/updateService');

//

var app = express();


// LOG

app.use(morgan('dev')); // log every request to the console

//VIEW

app.set('views', path.join(__dirname, 'app/view'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public/assets/img', 'favicon.ico')));

app.use(b_parser.urlencoded({ extended: true }));
app.use(b_parser.json());

app.use(express.static(__dirname + '/public'));

// DATABASE
mongoose.connect(database.localUrl, { useNewUrlParser: true }, function(err) {
    if (err)
        console.log('Errore di connessione al database');
}); // Connect to local MongoDB instance.

app.use(session({
    secret: server.sessionSecret,
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: server.cookieAge } // session maxAge defined in config/server.json
}));

// ROUTES

require('./app/route/route.js')(app);

// LOAD UPDATE SERVICE

app.set('updateService', updateService);
updateService.startedServer();

// START

app.listen(server.port);

console.log('server avviato sulla porta: ' + server.port);