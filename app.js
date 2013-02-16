
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , postsController = require('./controllers/postsController')
  , errorHandler = require('./libs/errors').handler;
var app = express();

var rewriteRules = function (req, res, next) {
    if (req.query._escaped_fragment_) {
        req.url = '/snapshots/';
        req.query.page = req.query._escaped_fragment_;
    }
    next();
}

var staticCaching = function(req, res, next) {
    var extension = req.url.substring(req.url.lastIndexOf('.') + 1);
    var cache = {
        'css': 1800,
        'png': 604800,
        'jpeg': 604800,
        'jpg': 604800,
        'js': 1800,
        'ico': 604800
    };

    var maxAge = cache[extension];
    if(maxAge) {
        res.setHeader('Cache-Control', 'max-age=' + maxAge);
    } else {
        res.setHeader('Cache-Control', 'max-age=10');
    }
    next();
};

app.configure('development', function(){
    app.use(express.logger('dev'));
});

app.configure('prod', function () {
    app.use(staticCaching);
});

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.compress());
    app.use(express.favicon(__dirname + '/public/favicon.ico'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: 'supersecretkeygoeshere'}));
    app.use(express.methodOverride());
    app.use(rewriteRules);
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(errorHandler);
});

app.configure('prod', function () {
    app.use(errorHandler);
});

if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "name":"",
    "db":"blog"
    }
}

var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}
var mongourl = generate_mongo_url(mongo);
mongoose.connect(mongourl);



require('./config/router')(app);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port') + ' env ' + app.get('env'));
});

module.exports=server;
