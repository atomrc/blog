/*global exports, require*/
var Snapshot = require('../models/Snapshot'),
    http = require('http'),

    serveSnapshot = function (req, res) {
        'use strict';
        var requestParams,
            request,
            datas = '';

        //if we are here that means a bot has made the request
        // we will send him the snapshot taken from seo4ajax
        requestParams = {
            host: 'api.seo4ajax.com',
            path: '/0d3c1b22f77991920099eadf23237938' + req.url,
            method: 'GET'
        };

        request = http.request(requestParams, function (response) {
            res.set(response.headers);
            response.on('data', function (chunk) {
                datas += chunk.toString('utf8');
            });
            response.on('end', function () {
                res.send(response.statusCode, datas);
            });
        });

        request.end();
        /*Snapshot.findOne({page: req.url}, function (err, snapshot) {
            if (!snapshot || err) { return next(); }
            res.send(snapshot.html);
        });*/
    };

exports.index = function (req, res, next) {
    'use strict';
    serveSnapshot(req, res, next);
};
