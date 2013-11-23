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

exports.reset = function (req, res) {
    'use strict';
    Tag
        .find({})
        .exec()
        .then(function (tags) {
            tags.forEach(function (tag) {
                Post
                    .find({ tags: tag.id })
                    .exec()
                    .then(function (posts) {
                        tag.posts = posts.map(function (post) {
                            return post.id;
                        });
                        tag.save();
                    });
            });
            res.send('done');

        });
};

exports.sync = function (req, res) {
    'use strict';
    var state = 0,
        log = {};

    Post
        .find({})
        .populate('tags')
        .exec()
        .then(function (posts) {
            log.add = [];
            posts.forEach(function (post) {
                post.tags.forEach(function (tag) {
                    if (tag.posts.indexOf(post.id) === -1) {
                        log.add.push('[+] ' + tag.name + ' <- ' + post.title);
                    } else {
                        log.add.push('[v] ' + tag.name + ' <- ' + post.title);
                    }
                });
            });
            state += 1;
            if (state === 11) {
                res.send(log);
            }
        });

    Tag
        .find({})
        .populate('posts')
        .exec()
        .then(function (tags) {
            log.remove = [];
            tags.forEach(function (tag) {
                tag.posts.forEach(function (post) {
                    if (post.tags.indexOf(tag.id) === -1) {
                        log.remove.push('[-] ' + tag.name + ' <- ' + post.title);
                    } else {
                        log.remove.push('[v] ' + tag.name + ' <- ' + post.title);
                    }
                });
            });
            state += 10;
            if (state === 11) {
                res.send(log);
            }
        });
};
