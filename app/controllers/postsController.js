/*jslint node: true, nomen: true, plusplus: true */
var Post         = require('../models/Post'),
    Tag          = require('../models/Tag'),
    NotFound     = require('../libs/errors').NotFound,
    postsManager = require('../managers/postsManager'),
    tagsManager  = require('../managers/tagsManager'),
    rssManager   = require('../managers/rssManager');

exports.index = function (req, res) {
    'use strict';
    postsManager
        .loadAll(!req.session.auth)
        .then(function (posts) {
            res.send(posts);
        });
};

exports.show = function (req, res, next) {
    'use strict';
    postsManager
        .load(req.params.postId, !req.session.auth)
        .then(function (post) {
            if (!post) { return next(new NotFound()); }
            res.send(post);
        }, function () {
            next(new NotFound());
        });
};

exports.find = function (req, res, next) {
    'use strict';
    postsManager
        .find(req.params.postSlug, !req.session.auth)
        .then(function (post) {
            if (!post) { return next(new NotFound()); }
            res.send(post);
        }, function () {
            next(new NotFound());
        });
};

exports.related = function (req, res, next) {
    'use strict';
    postsManager
        .load(req.params.postId, !req.session.auth)
        .then(function (post) {
            postsManager
                .findRelated(post)
                .then(function (posts) {
                    res.send(posts);
                });
        });
};

exports.create = function (req, res) {
    'use strict';
    var post = new Post(req.body);
    post.save(function (err, post) {
        res.send(post);
    });
};

exports.update = function (req, res, next) {
    'use strict';
    postsManager
        .load(req.params.postId, !req.session.auth)
        .then(function (post) {
            var i;
            delete req.body.tags;
            delete req.body.id;
            for (i in req.body) {
                if (req.body.hasOwnProperty(i)) {
                    post[i] = req.body[i];
                }
            }
            post.save(function (err, post) {
                res.send(post);
            });
        });
};

exports.feed = function (req, res) {
    'use strict';
    postsManager
        .loadAll(true, true)
        .then(function (posts) {
            res.setHeader("Content-Type", "text/xml; charset=utf-8");
            res.send(rssManager.generate(posts));
        });
};

exports.delete = function (req, res) {
    'use strict';
    postsManager
        .load(req.params.postId)
        .then(function (post) {
            post.remove();
            res.send(post);
        });
};

exports.tag = function (req, res, next) {
    'use strict';
    postsManager
        .load(req.params.postId)
        .then(function (post) {
            tagsManager
                .load(req.params.tagId)
                .then(function (tag) {
                    if (!tag) { return next(new NotFound()); }
                    postsManager.tag(post, tag);
                    tagsManager.affect(tag, post);
                    res.send(post);
                });
        });
};

exports.untag = function (req, res) {
    'use strict';
    var tagId = req.params.tagId,
        postId = req.params.postId;

    postsManager
        .untag(postId, tagId)
        .then(function (post) {
            return tagsManager
                .unaffect(tagId, postId)
                .then(function (tag) {
                    res.send(post);
                });
        });
};
