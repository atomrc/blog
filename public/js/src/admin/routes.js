/*global define, window*/

define(
    ['../routes', 'controllers'],
    function (routes, controllers) {
        'use strict';
        routes['/post/create'] = {templateUrl: '/views/posts_show', controller: controllers.posts.create};
        return routes;
    }
);

