var controllers  = require('../controllers'),
    nodemailer   = require('nodemailer'),
    express      = require('express'),
    Unauthorized = require('../libs/errors').Unauthorized,
    NotFound     = require('../libs/errors').NotFound,
    params       = require('../config/parameters'),
    Post         = require('../models/Post');


var isAuthenticated = function(req, res, next) {
    if(!req.session || !req.session.auth) { return next(new Unauthorized); }
    return next();
};

var authenticateApp =  express.basicAuth( function (user, pass) {
    return (user == params.user.username && pass == params.user.password);
});

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

var sendCommentMail = function (req, res, next) {
    var transport = nodemailer.createTransport('SMTP', params.mail);
    transport.sendMail({
        from: 'blog@thomasbelin.fr',
        to: params.mail.auth.user,
        subject: 'Nouveau commentaire sur ' + req.post.title,
        text: JSON.stringify(req.body)
    });

    transport.close();
    return next();
};

// Routes
module.exports = function(app) {

    app.get('/', controllers.homeController.index);

    app.get('/sitemap.xml', controllers.sitemapController.index);

    app.get('/login', authenticateApp, function (req, res) {
        req.session.auth = true;
        res.redirect('/');
    });

    //VIEWS
    app.get('/views/:view_id', controllers.viewsController.show);

    //POSTS
    app.get('/posts', controllers.postsController.index);
    app.post('/posts', isAuthenticated, controllers.postsController.create);
    app.get('/posts/:post_slug', loadPost, controllers.postsController.show);
    app.put('/posts/:post_slug', isAuthenticated, controllers.postsController.update);
    app.delete('/posts/:post_slug', isAuthenticated, loadPost, controllers.postsController.delete);

    //COMMENTS
    app.post('/posts/:post_slug/comments', loadPost, sendCommentMail, controllers.postsController.comment);
    app.delete('/posts/:post_slug/comments/:comment_id', isAuthenticated, loadPost, controllers.postsController.deleteComment);

    //TAGS
    app.post('/posts/:post_slug/tags', isAuthenticated, loadPost, controllers.postsController.tag);
    app.delete('/posts/:post_slug/tags/:tag_id', isAuthenticated, loadPost, controllers.postsController.deleteTag);

    app.post('/snapshot', controllers.snapshotsController.snapshot);
    app.get('/snapshots', controllers.snapshotsController.serveStatic);
}
