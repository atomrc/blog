/*jslint node: true*/
var controllers  = require('../controllers'),
    express      = require('express'),
    Unauthorized = require('../libs/errors').Unauthorized,
    NotFound     = require('../libs/errors').NotFound,
    params       = require('../config/parameters'),
    postsManager = require('../managers/postsManager'),

    isAuthenticated = function (req, res, next) {
        'use strict';
        if (!req.session || !req.session.auth) { return next(new Unauthorized()); }
        return next();
    },

    authenticateUser =  express.basicAuth(function (user, pass) {
        'use strict';
        return (user === params.user.username && pass === params.user.password);
    }),

    getSiteUrls = function (req, res, next) {
        'use strict';
        var urls = ['/'];
        postsManager
            .loadAll(true)
            .then(function (posts) {
                posts.forEach(function (post) {
                    urls.push('/posts/' + post.slug);
                });
                req.urls = urls;
                next();
            });
    };

// Routes
module.exports = function (app) {
    'use strict';

    /************ API ****************/
    //POSTS
    app.get('/api/posts', controllers.postsController.index);
    app.post('/api/posts', isAuthenticated, controllers.postsController.create);
    app.get('/api/posts/:postId', controllers.postsController.show);
    app.get('/api/posts/:postSlug/find', controllers.postsController.find);
    app.get('/api/posts/:postId/related', controllers.postsController.related);
    app.put('/api/posts/:postId', isAuthenticated, controllers.postsController.update);
    app.delete('/api/posts/:postId', isAuthenticated, controllers.postsController.delete);



    //TAGS
    app.post('/api/posts/:postId/tags/:tagId', isAuthenticated, controllers.postsController.tag);
    app.delete('/api/posts/:postId/tags/:tagId', isAuthenticated, controllers.postsController.untag);

    app.get('/api/tags/find', isAuthenticated, controllers.tagsController.find);
    app.get('/api/tags', /*isAuthenticated,*/ controllers.tagsController.index);
    app.post('/api/tags', isAuthenticated, controllers.tagsController.create);
    app.get('/api/tags/sync', /*isAuthenticated,*/ controllers.tagsController.sync);
    app.get('/api/tags/reset', /*isAuthenticated,*/ controllers.tagsController.reset);
    /*app.get('/api/tags', isAuthenticated, loadTags, controllers.tagsController.index);
    app.get('/api/tags/:tag_id', loadTag, controllers.tagsController.show);
    app.delete('/api/tags/:tag_id', isAuthenticated, loadTag, controllers.tagsController.delete);*/

    /*app.post('/api/snapshots', authenticateApp, controllers.snapshotsController.snapshot);
    app.get('/snapshots/stats', controllers.snapshotsController.stats);
    app.get('/snapshots/clean', getSiteUrls, controllers.snapshotsController.clean);*/

    app.get('/sitemap.:format', getSiteUrls, controllers.sitemapController.index);

    //RSS FEED
    app.get('/feed', controllers.postsController.feed);

    app.get('/login', authenticateUser, function (req, res) {
        req.session.auth = true;
        res.redirect('/');
    });

    //FRONT
    app.get('/', controllers.homeController.index);
    app.get('/posts*', controllers.homeController.index);
};
