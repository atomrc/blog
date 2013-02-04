var Post     = require('../models/Post');
var Comment  = require('../models/Comment');
var Tag  = require('../models/Tag');
var NotFound = require('../libs/errors').NotFound;

exports.index = function(req, res) {
    var condition = req.session.auth ?
        {} :
        { published: true };

    var options = req.query.limit ?
        { limit: req.query.limit } :
        {};

    var posts = Post.find(condition, '-comments', options, function (err, posts) {
        if( err ) throw new NotFound;
        res.send(posts);
    });
}

exports.show = function(req, res, next) {
    res.send(req.post);
}

exports.create = function(req, res) {
    var post = new Post(req.body);
    post.save(function(err, post){
        res.send(post);
    });
}

exports.comment = function(req, res) {
    var post = req.post;
    var comment = new Comment(req.body);
    post.comments.push(comment);
    post.save(function( err, post) {
        if(err) res.send(err);
        res.send(post);
    });
}

exports.deleteComment = function(req, res) {
    Post.findOneAndUpdate(
        { slug: req.params.post_slug },
        {$pull : {comments: { _id: req.params.comment_id }}},
        function( err, post ) {
            res.send(post);
        }
    );
}

exports.tag = function (req, res) {
    var post = req.post;
    var tag = new Tag(req.body);
    post.tags.push(tag);
    post.save(function( err, post) {
        if(err) res.send(err);
        res.send(post);
    });
};

exports.deleteTag = function (req, res) {
    Post.findOneAndUpdate(
        { slug: req.params.post_slug },
        {$pull : {tags: { _id: req.params.tag_id }}},
        function( err, post ) {
            if(err) res.send(err);
            res.send(post);
        }
    );
};

exports.update = function(req, res, next) {
    Post.findOneAndUpdate(
        { slug: req.params.post_slug},
        req.body,
        function( err, post ) {
            if( err ) return next(err);
            if( !post ) return next(new NotFound);
            res.send(post);
        }
    );
}

exports.delete = function(req, res) {
    var post = req.post;
    post.remove();
    res.send(post);
}
