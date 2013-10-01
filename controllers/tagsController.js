/*global require, exports*/
var Tag  = require('../models/Tag'),
    Post = require('../models/Post'),
    NotFound = require('../libs/errors').NotFound;

exports.index = function (req, res) {
    'use strict';
    Tag
        .find({})
        .exec()
        .then(function (tags) {
            res.send(tags);
        });
};

exports.show = function (req, res) {
    'use strict';
    res.send(req.tag);
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
    Tag.find({ name: { $regex: '^' + req.body.name + '$', $options: 'i' } }, function (err, tags) {
        if (tags.length > 0) {
            return res.send(tags[0]);
        }
        var tag = new Tag(req.body);
        tag.save(function (err, tag) {
            res.send(tag);
        });
    });
};

exports.delete = function (req, res) {
    'use strict';
    var tag = req.tag;
    tag.remove();
    res.send(tag);
};

exports.sync = function (req, res) {
    'use strict';
    var state = 0,
        log = [];

    Post
        .find({})
        .populate('tags')
        .exec()
        .then(function (posts) {
            state += 1;
            posts.forEach(function (post) {
                post.tags.forEach(function (tag) {
                    if (tag.posts.indexOf(post.id) === -1) {
                        log.push('[+] ' + post.title + ' -> ' + tag.name);
                    }
                });
            });
            if (state === 11) {
                res.send(log);
            }
        });

    Tag
        .find({})
        .populate('posts')
        .exec()
        .then(function (tags) {
            state += 10;
            tags.forEach(function (tag) {
                tag.posts.forEach(function (post) {
                    if (post.tags.indexOf(tag.id) === -1) {
                        log.push('[-] ' + post.title + ' -> ' + tag.name);
                    }
                });
            });
            if (state === 11) {
                res.send(log);
            }
        });
};
