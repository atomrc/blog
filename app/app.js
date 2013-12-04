/*jslint node: true, nomen: true, plusplus: true */

/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require('./libs/errors').handler,
    app = express(),
    mongo,
    env,

    staticCaching = function (req, res, next) {
        'use strict';
        var extension = req.url.substring(req.url.lastIndexOf('.') + 1),
            cache = {
                'css': 1800,
                'png': 604800,
                'jpeg': 604800,
                'jpg': 604800,
                'js': 1800,
                'ico': 604800
            },
            maxAge = cache[extension];

        if (maxAge) {
            res.setHeader('Cache-Control', 'max-age=' + maxAge);
        } else {
            res.setHeader('Cache-Control', 'max-age=10');
        }
        next();
    },

    rewriteRules = function (req, res, next) {
        'use strict';
        var botRegexp = /(bot|spider|archiver|google|facebook|twitter|pinterest)/i,
            isBot = req.headers['user-agent'].match(botRegexp);

        if (!isBot) {
            //in case of a human requesting one of the front urls
            //serving the static application.html file
            var url = require('url').parse(req.url),
                templatePath = '';
            if (url.pathname.match(/^\/$|^\/posts\/.*$/)) {
                templatePath = (req.session || {}).auth ?
                    'application.admin.html' :
                    'application.html';
                req.url = '/partials/' + templatePath;
            }
            return next();
        }
        //setting a query param that will tells the home controller to get the snapshot instead of the single page layout
        req.query.snap = 1;
        next();
    },

    generateMongoUrl = function (obj) {
        'use strict';
        obj.hostname = (obj.hostname || 'localhost');
        obj.port = (obj.port || 27017);
        obj.db = (obj.db || 'test');
        if (obj.username && obj.password) {
            return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
        }
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    };

app.configure('development', function () {
    'use strict';
    app.use(express.logger('dev'));
});

app.configure('prod', function () {
    'use strict';
    app.use(staticCaching);
});

app.configure(function () {
    'use strict';
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.use(express.compress());
    app.use(express.cookieParser());
    app.use(express.session({secret: 'supersecretkeygoeshere'}));
    app.use(rewriteRules);
    app.use(express.static(path.join(__dirname, '/public')));
    app.use(express.favicon(path.join(__dirname, '/public/favicon.ico')));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

app.configure('development', function () {
    'use strict';
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(errorHandler);
});

app.configure('prod', function () {
    'use strict';
    app.use(errorHandler);
});

if (process.env.VCAP_SERVICES) {
    env = JSON.parse(process.env.VCAP_SERVICES);
    mongo = env['mongodb-1.8'][0].credentials;
} else {
    mongo = {
        "hostname": "localhost",
        "port": 27017,
        "username": "",
        "password": "",
        "name": "",
        "db": "blog"
    };
}

mongoose.connect(generateMongoUrl(mongo));


require('./config/router')(app);

var server = http.createServer(app);
server.listen(app.get('port'), function () {
    'use strict';
    console.log("Express server listening on port " + app.get('port') + ' env ' + app.get('env'));
});

module.exports = server;
