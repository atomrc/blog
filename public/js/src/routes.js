/*global define, window*/

define(['controllers'],
    function (controllers) {
        'use strict';
        return {
            '/': {templateUrl: 'views/home', controller: controllers.home.index},
            '/posts': {templateUrl: 'views/posts_index',   controller: controllers.posts.index},
            '/posts/create': {templateUrl: 'views/posts_create', controller: controllers.posts.create},
            '/posts/:postSlug/edit': {templateUrl: 'views/posts_create', controller: controllers.posts.edit},
            '/posts/:postSlug': {templateUrl: 'views/posts_show', controller: controllers.posts.show}
        };
    }
);

