/*jslint node: true, nomen: true */
/*global require, exports*/
var Post = require('../models/Post'),
    Tag  = require('../models/Tag'),
    NotFound = require('../libs/errors').NotFound,
    RSS = require('rss'),
    suggester = require('../services/suggester');

exports.index = function (req, res) {
    'use strict';
    res.send(req.posts);
};

exports.feed = function (req, res) {
    'use strict';
    var feed = new RSS({
        title: 'Why So Curious ?',
        description: 'The web is my scene, HTML5/CSS3 are my sound engineers, JS is my guitar, the web standards are my tablature and last but not least you might be my audience ;)',
        feed_url: 'http://thomasbelin.fr/feed',
        site_url: 'http://thomasbelin.fr',
        image_url: 'http://thomasbelin.fr/favicon.png',
        author: 'Thomas Belin'
    });

    /* loop over data and add to feed */
    for (var i = 0; i < req.posts.length; i++) {
        var post = req.posts[i];
        feed.item({
            title:  post.title,
            description: post.body,
            url: 'http://thomasbelin.fr/posts/' + post.slug, // link to the item
            author: 'Thomas Belin', // optional - defaults to feed author property
            date: post.pubdate // any format that js Date can parse.
        });
    }

    var xml = feed.xml();

    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.send(xml);
};

exports.show = function (req, res, next) {
    'use strict';
    res.send(req.post);
};

exports.suggest = function (req, res) {
    'use strict';
    suggester.suggest(req.post);
    res.send('soon');
};

exports.create = function (req, res) {
    'use strict';
    var post = new Post(req.body);
    post.save(function (err, post){
        res.send(post);
    });
};

exports.update = function (req, res, next) {
    'use strict';
    var i,
        post = req.post;
    delete req.body.tags;
    delete req.body._id;
    for (i in req.body) {
        if (req.body.hasOwnProperty(i)) {
            req.post[i] = req.body[i];
        }
    }
    post.save(function (err, post) {
        if (err || !post) { return res.send('error'); }
        res.send(post);
    });
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

    Post.findByIdAndUpdate(
        req.params.post_id,
        { $pull : { tags: req.params.tag_id }}
    ).populate('tags').exec(function ( err, post ) {
        if(err) res.send(err);
        Tag.findByIdAndUpdate(req.params.tag_id, { $pull: { posts: req.params.post_id }}, function () {
            post.populate('tags');
            res.send(post);
        });
    });

};

exports.delete = function (req, res) {
    var post = req.post;
    post.remove();
    res.send(post);
};
