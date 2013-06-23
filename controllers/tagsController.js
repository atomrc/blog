/*global require, exports*/
var Tag  = require('../models/Tag'),
    NotFound = require('../libs/errors').NotFound;

exports.index = function (req, res) {
    'use strict';
    res.send(req.posts);
};

exports.find = function (req, res, next) {
    'use strict';
    var searchValue = req.query.term;
    Tag.find({ name: { $regex: '^' + req.query.term, $options: 'i' } }, function (err, tags) {
        if (err) { res.send([]); }
        res.send(tags);
    });
};

exports.create = function (req, res) {
    'use strict';
    var tag = new Tag(req.body);
    tag.save(function (err, tag) {
        res.send(tag);
    });
};

exports.delete = function (req, res) {
    'use strict';
    var post = req.post;
    post.remove();
    res.send(post);
};
