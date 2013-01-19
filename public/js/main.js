/*global require, define, angular, window*/

require.config({
    baseUrl: 'js/src',
    paths: {
        angular: '../lib/angular.amd',
        ngSanitize: '../lib/angular.sanitize.min'
    }
});

require(['angular', 'controllers', 'services'], function (Angular, controllers, services) {
    'use strict';
    var nbSanitize = require(['ngSanitize'], function () {
        Angular
            .module('blog', ['ngSanitize'], function ($provide) {
                $provide.factory('application', function () { return services.application; });
                $provide.factory('tweetsNormalizer', services.tweetsNormalizer);
            })
            .config(['$routeProvider', function ($routeProvider) {
                $routeProvider
                    .when('/', {templateUrl: 'views/home',   controller: controllers.home.index})
                    .when('/posts', {templateUrl: 'views/posts',   controller: controllers.posts.index})
                    .when('/posts/create', {templateUrl: 'views/create', controller: controllers.posts.create})
                    .when('/posts/:postSlug', {templateUrl: 'views/post', controller: controllers.posts.show})
                    .otherwise({redirectTo: '/'});
            }]);
        Angular.bootstrap(window.document, ['blog']);
    });
});
