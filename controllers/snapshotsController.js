var Snapshot = require('../models/Snapshot'),
    NotFound = require('../libs/errors').NotFound;

exports.snapshot = function(req, res) {
    var page = req.body.page.replace('#', '');
    Snapshot.findOneAndUpdate({page: page}, {page: page, html: req.body.html}, {upsert: true}, function (err, snap) {
        res.send(snap);
    });
}

exports.serveStatic = function (req, res, next) {
    console.log(req.query);
    Snapshot.findOne({page: req.query.page}, function (err, snapshot) {
        if (err || snapshot === null) { return next(new NotFound()); }
        res.send(snapshot.html);
    })
}
