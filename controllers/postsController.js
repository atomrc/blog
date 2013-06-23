/*global require, exports*/
var Post = require('../models/Post'),
    Tag  = require('../models/Tag'),
    NotFound = require('../libs/errors').NotFound,
    RSS = require('rss'),
    suggester = require('../services/suggester'),
    associateTag = function (post, tag, callback) {
        'use strict';
        tag.posts.push(post);
        tag.save(function (err, tag) {
            callback(tag);
            post.tags.push(tag);
            post.save(function (err, post) {
            });
        });
    };

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
    res.send(req.post);
};

exports.suggest = function (req, res) {
    suggester.suggest(req.post);
    res.send('soon');
};

exports.create = function (req, res) {
    var post = new Post(req.body);
    post.save(function (err, post){
        res.send(post);
    });
};

exports.reset = function (req, res) {
    var post = req.post;
    post.slug = null;
    post.pubdate = null;
    post.save(function (err, post) {
        if(err) res.send(err);
        res.send(post);
    });
};

exports.createTag = function (req, res) {
    associateTag(req.post, new Tag(req.body), function (tag) {
        res.send(tag);
    });
};

exports.affectTag = function (req, res) {
    associateTag(req.post, req.tag, function (tag) {
        res.send(tag);
    });
};

exports.deleteTag = function (req, res) {
    Post.findOneAndUpdate(
        { slug: req.params.post_slug },
        {$pull : {tags: req.params.tag_id }},
        function ( err, post ) {
            if(err) res.send(err);
            Tag.findOneAndUpdate(
                { _id: req.params.tag_id },
                { $pull: { posts:  post._id }},
                function (err, tag) {
                    res.send(tag);
            });
        }
    );
};

exports.update = function (req, res, next) {
    delete req.body._id;
    Post.findOneAndUpdate(
        { slug: req.params.post_slug},
        req.body,
        function ( err, post ) {
            if( err ) return next(err);
            if( !post ) return next(new NotFound);
            res.send(post);
        }
    );
};

exports.delete = function (req, res) {
    var post = req.post;
    post.remove();
    res.send(post);
};

exports.purgeTags = function (req, res) {
    var i = 0,
        post,
        deletedTags = [];
    console.log(req.posts);
    for (i; i < req.posts.length; i++) {
        post = req.posts[i];
        deletedTags.push({post: post.title, tags: post.tags});
        /*post.tags = [];
        post.save();*/
    }
    res.send(deletedTags);
};
