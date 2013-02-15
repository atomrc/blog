/*global define, window*/

define(['controllers'],
    function (controllers) {
        'use strict';
        var animation = null,
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

        //the function that will handle the animation
        animation = ['$timeout', '$window', function (timeout, $window) {
            var content = $window.document.getElementById('main-content');
            //case of the first loading
            if (content.className === 'hide') {
                content.className = '';
                return;
            }

            content.className = 'hide';
            return timeout(function () {
                content.className = '';
            }, 300);
        }];

        //add the animation transition resolution
        for (var routeIndex in routes) {
            var route = routes[routeIndex];
            route.resolve.animation = animation;
        }

        return routes;
    }
);

