/*global require, exports*/
var Post = require('../models/Post'),
    Tag  = require('../models/Tag'),
    NotFound = require('../libs/errors').NotFound,
    RSS = require('rss');

exports.index = function (req, res) {
    'use strict';
    res.send(req.posts);
};

exports.feed = function(req, res) {
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
    for(var i = 0; i < req.posts.length; i++) {
        var post = req.posts[i];
        feed.item({
            title:  post.title,
            description: post.body,
            url: 'http://thomasbelin.fr/#!/posts/' + post.slug, // link to the item
            author: 'Thomas Belin', // optional - defaults to feed author property
            date: post.pubdate // any format that js Date can parse.
        });
    }

    var xml = feed.xml();

    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.send(xml);
};

exports.show = function(req, res, next) {
    res.send(req.post);
};

exports.create = function(req, res) {
    var post = new Post(req.body);
    post.save(function(err, post){
        res.send(post);
    });
};

exports.tag = function (req, res) {
    var post = req.post;
    var tag = new Tag(req.body);
    post.tags.push(tag);
    post.save(function( err, post) {
        if(err) res.send(err);
        res.send(post.tags.pop());
    });
};

exports.deleteTag = function (req, res) {
    Post.findOneAndUpdate(
        { slug: req.params.post_slug },
        {$pull : {tags: { _id: req.params.tag_id }}},
        function( err, post ) {
            if(err) res.send(err);
            res.send();
        }
    );
};

exports.update = function(req, res, next) {
    delete req.body._id;
    Post.findOneAndUpdate(
        { slug: req.params.post_slug},
        req.body,
        function( err, post ) {
            if( err ) return next(err);
            if( !post ) return next(new NotFound);
            res.send(post);
        }
    );
};

exports.delete = function(req, res) {
    var post = req.post;
    post.remove();
    res.send(post);
};
