var controllers  = require('../controllers');
var Unauthorized = require('../libs/errors').Unauthorized;
var NotFound     = require('../libs/errors').NotFound;
var Post         = require('../models/Post');

var isAuthenticated = function(req, res, next) {
    if(!req.session || !req.session.auth) { return next(new Unauthorized); }
    return next();
};

var authenticateApp = function (req, res, next) {
    if(req.query.apikey != null) {
        req.session.auth = true;
    }
    res.redirect('/');
};

var loadPost = function(req, res, next) {
    Post.findOne({slug: req.params.post_slug}, function(err, post) {
        if( err ) return next(new NotFound);
        if( post === null ) return next(new NotFound);
        req.post = post;
        return next();
    });
};

// Routes
module.exports = function(app) {

    app.get('/', controllers.homeController.index);


    app.get('/login', authenticateApp);

    //VIEWS
    app.get('/views/:view_id', controllers.viewsController.show);

    //POSTS
    app.get('/posts', controllers.postsController.index);
    app.post('/posts', isAuthenticated, controllers.postsController.create);
    app.get('/posts/:post_slug', loadPost, controllers.postsController.show);
    app.put('/posts/:post_slug', isAuthenticated, controllers.postsController.update);
    app.delete('/posts/:post_slug', isAuthenticated, loadPost, controllers.postsController.delete);

    //COMMENTS
    app.post('/posts/:post_slug/comments', loadPost, controllers.postsController.comment);
    app.delete('/posts/:post_slug/comments/:comment_id', isAuthenticated, loadPost, controllers.postsController.deleteComment);

    //TAGS
    app.post('/posts/:post_slug/tags', isAuthenticated, loadPost, controllers.postsController.tag);
    app.delete('/posts/:post_slug/tags/:tag_id', isAuthenticated, loadPost, controllers.postsController.deleteTag);
}
