var Snapshot = require('../models/Snapshot'),
    NotFound = require('../libs/errors').NotFound;

exports.serveStatic = function (req, res) {
    'use strict';
    Snapshot.findOne({page: req.url}, function (err, snapshot) {
        var content = snapshot !== null ? snapshot.html : '';
        var title = snapshot !== null ? snapshot.title : 'Why So Curious ?';
        res.render('index', { auth: req.session.auth, prod: req.app.get('env') === 'prod', content: content, title: title});
    });
}

exports.snapshot = function(req, res) {
    var page = req.body.page;
    Snapshot.findOneAndUpdate({page: page}, {page: page, html: req.body.html, title: req.body.title}, {upsert: true}, function (err, snap) {
        res.send(snap);
    });
};

exports.clean = function(req, res) {
    var condition = {page: { $not: { $in: req.urls } } };
    Snapshot.find(condition, '-_id', function (err, snapshots) {
        if (snapshots.length == 0) {
            res.send('database is clean');
            return;
        }
        Snapshot.remove(condition, function (err, nb) {
            snapshots.push(nb);
            res.send(snapshots);
        });
    });
};

exports.stats = function(req, res) {
    Snapshot.find({}, '-html -_id', function (err, snapshots) {
        res.send(snapshots);
    });
};

