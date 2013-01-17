/*global define */
define([
    'backbone',
    'controllers/home',
    'controllers/posts',
    'controllers/errors'
], function (Backbone, homeController, postsController, errorsController) {
    'use strict';
    var app = {
        initialize: function () {
            var router = new Backbone.Router();
            router.route("", "home", homeController.index.bind(homeController));
            router.route("!/", "home", homeController.index.bind(homeController));
            router.route("!/posts", "posts", postsController.index.bind(postsController));
            router.route("!/posts/:slug", "post", postsController.show.bind(postsController));
            router.route("!/posts/new", "new-post", postsController.build.bind(postsController));
            /*router.route("!/about", "about", controllers.about.index.bind(controllers.about));*/
            router.route("!/404", "not-found", errorsController.notFound);
            Backbone.history.start();
        }
    };

    return app;
});
