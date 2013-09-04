/*jslint node: true, nomen: true, plusplus: true */
var Post                  = require('../models/Post'),
    Tag                   = require('../models/Tag'),
    NotFound              = require('../libs/errors').NotFound,
    postsManager          = require('../managers/postsManager'),
    rssManager            = require('../managers/rssManager'),
    suggester             = require('../services/suggester');

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
            console.log(arguments);
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
            delete req.body._id;
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

exports.suggest = function (req, res) {
    'use strict';
    suggester.suggest(req.post);
    res.send('soon');
};


exports.tag = function (req, res) {
    'use strict';
    var post = req.post,
        tag = req.tag,
        alreadyAdded = post.tags.reduce(function (prev, current) {
            return prev || current._id.toString() === tag._id.toString();
        }, false);
    if (alreadyAdded) {
        return res.send(post);
    }
    tag.posts.push(post);
    tag.save(function (err, tag) {
        post.tags.push(tag);
        post.save(function (err, p) {
            res.send(post);
        });
    });
};

exports.untag = function (req, res) {
    'use strict';
    Post.findByIdAndUpdate(
        req.params.postId,
        { $pull : { tags: req.params.tag_id }}
    ).populate('tags').exec(function (err, post) {
        if (err) { res.send(err); }
        Tag.findByIdAndUpdate(req.params.tag_id, { $pull: { posts: req.params.postId }}, function () {
            post.populate('tags');
            res.send(post);
        });
    });

};

exports.delete = function (req, res) {
    'use strict';
    var post = req.post;
    post.remove();
    res.send(post);
};
