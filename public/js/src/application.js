/*global angular, $routeProvider, define, window*/

define([ 'angular', 'controllers' ],

    function (Angular, controllers) {
        'use strict';
        var application = {
            initialize: function () {
                angular
                    .module('blog', [])
                    .config(['$routeProvider', function ($routeProvider) {
                        $routeProvider
                            .when('/', {templateUrl: 'views/home.html',   controller: controllers.home.index})
                            .when('/posts', {templateUrl: 'views/posts.html',   controller: controllers.posts.index})
                            .when('/posts/:postSlug', {templateUrl: 'partials/post.html', controller: controllers.posts.show})
                            .otherwise({redirectTo: '/'});
                    }]);
                angular.bootstrap(window.document, ['blog']);
            }
        };

        return application;
    }
);
