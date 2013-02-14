/*global define, window*/

define(['controllers'],
    function (controllers) {
        'use strict';
        var animationDelay = null,
            routes = null;

        routes = {
            '/': {
                templateUrl: 'views/home',
                controller: controllers.home.index,
                resolve: controllers.home.indexResolve
            },

            '/posts': {
                templateUrl: 'views/posts_index',
                controller: controllers.posts.index,
                resolve: controllers.posts.indexResolve
            },

            '/posts/:postSlug': {
                templateUrl: 'views/posts_show',
                controller: controllers.posts.show,
                resolve: controllers.posts.showResolve
            }
        };

        animationDelay = ['$timeout', '$location', function (timeout, rootScope) {
            console.log(rootScope);
            return timeout(function () {}, 300);
        }];

        for (var routeIndex in routes) {
            var route = routes[routeIndex];
            route.resolve.animationDelay = animationDelay;
        }

        return routes;
    }
);

