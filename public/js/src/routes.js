/*global define, window*/

define(['controllers'],
    function (controllers) {
        'use strict';
        return {
            '/': {templateUrl: 'views/home', controller: controllers.home.index},
            '/posts': {templateUrl: 'views/posts_index',   controller: controllers.posts.index},
            '/posts/:postSlug': {templateUrl: 'views/posts_show', controller: controllers.posts.show}
        };
    }
);

