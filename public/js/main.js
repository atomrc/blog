/*global require, define, angular*/

require.config({
    baseUrl: 'js/src',
    paths: {
        angular: '../lib/angular.amd'
    }
});

require(['angular', 'controllers', 'services'], function (Angular, controllers, services) {
    'use strict';
    Angular
        .module('blog', [], function ($provide) {
            $provide.factory('application', function () { return services.application; });
            $provide.factory('urlBuilder', ['application', services.urlBuilder]);
        })
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/', {templateUrl: 'views/home',   controller: controllers.home.index})
                .when('/posts', {templateUrl: 'views/posts',   controller: controllers.posts.index})
                .when('/posts/create', {templateUrl: 'views/create', controller: controllers.posts.create})
                .when('/posts/:postSlug', {templateUrl: 'views/post', controller: controllers.posts.show})
                .otherwise({redirectTo: '/'});
        }]);
        angular.bootstrap(window.document, ['blog']);
});
