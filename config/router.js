var controllers  = require('../controllers'),
    express      = require('express'),
    Unauthorized = require('../libs/errors').Unauthorized,
    NotFound     = require('../libs/errors').NotFound,
    params       = require('../config/parameters'),
    Post         = require('../models/Post');


var isAuthenticated = function(req, res, next) {
    'use strict';
    if(!req.session || !req.session.auth) { return next(new Unauthorized); }
    return next();
};

var authenticateUser =  express.basicAuth( function (user, pass) {
    'use strict';
    return (user === params.user.username && pass === params.user.password);
});

var authenticateApp = function (req, res, next) {
    'use strict';
    if ((!req.query.apikey) || (req.query.apikey !== params.apikey)) { return next(new Unauthorized); }
    return next();
};

var loadPost = function(req, res, next) {
    var condition = {slug: req.params.post_slug};
    if ( !req.session.auth ) {
        condition.published = true;
    }
    Post.findOne(condition, function(err, post) {
        if( err ) return next(new NotFound);
        if( post === null ) return next(new NotFound);
        req.post = post;
        return next();
    });
};

var loadPosts = function (req, res, next) {
    var condition = req.session.auth ?
        {} :
        { published: true };

    var options = req.query.limit ?
        { limit: req.query.limit } :
        {};

    var posts = Post.find(condition, '', options).sort({'pubdate': 'desc'}).exec(function (err, posts) {
        if( err ) throw new NotFound;
        req.posts = posts;
        next();
    });
};

var getSiteUrls = function (req, res, next) {
    var urls = ['/', '/posts'];
    Post.find({published: true}, function (err, posts) {
        if( err ) throw new NotFound;
        for(var i in posts) {
            var post = posts[i];
            urls.push('/posts/'+post.slug);
        }
        req.urls = urls;
        next();
    });
};

// Routes
module.exports = function(app) {

    /************ API ****************/
    //POSTS
    app.get('/api/posts', loadPosts, controllers.postsController.index);
    app.post('/api/posts', isAuthenticated, controllers.postsController.create);
    app.get('/api/posts/:post_slug', loadPost, controllers.postsController.show);
    app.put('/api/posts/:post_slug', isAuthenticated, controllers.postsController.update);
    app.delete('/api/posts/:post_slug', isAuthenticated, loadPost, controllers.postsController.delete);

    //TAGS
    app.post('/api/posts/:post_slug/tags', isAuthenticated, loadPost, controllers.postsController.tag);
    app.delete('/api/posts/:post_slug/tags/:tag_id', isAuthenticated, loadPost, controllers.postsController.deleteTag);

    app.post('/api/snapshots', authenticateApp, controllers.snapshotsController.snapshot);
    app.get('/snapshots/stats', controllers.snapshotsController.stats);
    app.get('/snapshots/clean', getSiteUrls, controllers.snapshotsController.clean);

    //FRONT
    //app.get('/', controllers.homeController.index);
    app.get('/', controllers.snapshotsController.serveStatic);
    app.get('/posts/:post_slug', controllers.snapshotsController.serveStatic);
    app.get('/404', controllers.snapshotsController.serveStatic);

    app.get('/sitemap.:format', getSiteUrls, controllers.sitemapController.index);

    app.get('/login', authenticateUser, function (req, res) {
        req.session.auth = true;
        res.redirect('/');
    });

    //RSS FEED
    app.get('/feed', loadPosts, controllers.postsController.feed);

    //VIEWS
    app.get('/views/:view_id', controllers.viewsController.show);

}
