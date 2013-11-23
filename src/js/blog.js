/*global define*/

define(['ngRoute', 'ngResource'], function () {
    'use strict';
    return function (app) {

        app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
            $locationProvider.html5Mode(true);
            $routeProvider

                .when('/', {
                    templateUrl: '/page/home.html',
                    resolve: {
                        posts: ['postsManager', function (postsManager) {
                            return postsManager.query();
                        }],
                    },
                    controller: ['$scope', 'posts', function ($scope, posts) {
                        $scope.posts = posts;
                    }]
                })

                .when('/posts/:postSlug', {
                    templateUrl: '/page/post.html',
                    resolve: ['postsManager', function (postsManager) {
                    }]
                });
        }]);


        /**
         * FILTERS
         */
        app.filter('trustAsHtml', ['$sce', function ($sce) {
            return function (input) {
                return $sce.trustAsHtml(input);
            };
        }]);

        /**
         * SERVICES
         */
        app

            .factory('post', ['$resource', function ($resource) {
                return $resource('/api/posts/:id', {id: '@id'});
            }])

            .factory('postsManager', ['post', function (post) {
                return {
                    posts: null,
                    query: function () {
                        var self = this;
                        if (!this.posts) { //caching
                            this.posts = post.query();
                        }
                        return this.posts;
                    }
                };
            }]);

        /**
         * DIRECTIVES
         */
        app

            .directive('postsContainer', [function () {
                return {
                    restrict: 'A',
                    templateUrl: '/posts.html'
                };
            }])

            .directive('postContainer', [function () {
                return {
                    restrict: 'A',
                    templateUrl: "/post.html",
                    controller: ['$scope', '$attrs', function ($scope, $attrs) {
                        $scope.full = $scope.$eval($attrs.postContainer);
                        $scope.load = function (post) {
                            post.$get();
                            this.full = true;
                        };
                    }]
                };
            }]);
    };
});
