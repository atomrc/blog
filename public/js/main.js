/*global require, define, angular, window*/

require.config({
    baseUrl: 'js/src',
    paths: {
        angular: '../lib/angular.amd',
        wysiwyg: '../lib/wysiwyg.min',
        ngSanitize: '../lib/angular.sanitize.min'
    }
});

require(['angular', 'controllers', 'services', 'directives'], function (Angular, controllers, services, directives) {
    'use strict';
    var nbSanitize = require(['ngSanitize'], function () {
        Angular
            .module('blog', ['ngSanitize'], function ($provide) {
                $provide.factory('application', function () { return services.application; });
                $provide.factory('tweetsNormalizer', services.tweetsNormalizer);
            })
            .directive('draggable', directives.draggable)
            .config(['$routeProvider', function ($routeProvider) {
                $routeProvider
                    .when('/', {templateUrl: 'views/home',   controller: controllers.home.index})
                    .when('/posts', {templateUrl: 'views/posts_index',   controller: controllers.posts.index})
                    .when('/posts/create', {templateUrl: 'views/posts_create', controller: controllers.posts.create})
                    .when('/posts/:postSlug/edit', {templateUrl: 'views/posts_create', controller: controllers.posts.edit})
                    .when('/posts/:postSlug', {templateUrl: 'views/posts_show', controller: controllers.posts.show})
                    .otherwise({redirectTo: '/'});
            }]);
        Angular.bootstrap(window.document, ['blog']);
    });
});
