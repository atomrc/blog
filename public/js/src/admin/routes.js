/*global define, window*/

define(
    ['../routes', 'controllers'],
    function (routes, controllers) {
        'use strict';
        routes['/post/create'] = {templateUrl: 'views/posts_create', controller: controllers.posts.create};
        routes['/posts/:postSlug/edit'] = {templateUrl: 'views/posts_create', controller: controllers.posts.edit, resolve: controllers.posts.editResolve};
        return routes;
    }
);

