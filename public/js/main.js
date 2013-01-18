/*global require, define, angular*/

require.config({
    baseUrl: 'js/src',
    paths: {
        angular: '../lib/angular.amd'
    }
});

require(['angular', 'controllers'], function (Angular, controllers) {
    'use strict';
    Angular
        .module('blog', [])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/', {templateUrl: 'views/home',   controller: controllers.home.index})
                .when('/posts', {templateUrl: 'views/posts',   controller: controllers.posts.index})
                .when('/posts/:postSlug', {templateUrl: 'views/post', controller: controllers.posts.show})
                .otherwise({redirectTo: '/'});
        }]);
        angular.bootstrap(window.document, ['blog']);
});
