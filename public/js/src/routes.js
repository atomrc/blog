/*global define, window*/

define(['controllers'],
    function (controllers) {
        'use strict';
        return {
            '/': {templateUrl: 'views/home', controller: controllers.home.index, resolve: controllers.home.index.resolve},
            '/posts': {templateUrl: 'views/posts_index', controller: controllers.posts.index, resolve: controllers.posts.index.resolve},
            '/posts/:postSlug': {templateUrl: 'views/posts_show', controller: controllers.posts.show, resolve: controllers.posts.show.resolve}
        };
    }
);

