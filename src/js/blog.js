/*global define*/

define(['ngRoute', 'ngResource', 'ngAnimate'], function () {
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
                    resolve: {
                        post: ['postsManager', '$route', function (postsManager, $route) {
                            var postSlug = $route.current.params.postSlug;
                            return postsManager.get(postSlug);
                        }]
                    },
                    controller: ['$scope', 'post', function ($scope, post) {
                        $scope.post = post;
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

            .factory('Post', ['$resource', function ($resource) {
                return $resource('/api/posts/:id/:action', {id: '@id'},
                    { find: { method: 'GET', params: { action: 'find' } } }
                );
            }])

            .factory('postsManager', ['Post', function (Post) {
                var posts,
                    find = function (slug) {
                        var filtered = [];
                        if (!posts) { return false; }
                        filtered = posts.filter(function (post) {
                            return post.slug === slug;
                        });
                        return filtered[0] || false;
                    };

                return {
                    /**
                     * query retrieve all the posts from the server
                     * if the posts are already loaded, just return them without any HTTP request
                     *
                     * @return {Promise}
                     */
                    query: function () {
                        if (!posts) { //caching
                            posts = Post.query();
                        }
                        return posts;
                    },

                    /**
                     * get a single post from the server
                     * if the post in in cache load it by its id
                     * else will send a find request to the server with the slug of the post
                     *
                     * @param {String} slug
                     * @return {Promise}
                     */
                    get: function (slug) {
                        var post = find(slug);
                        if (post) {
                            post.$loading = true;
                            return post.body ? post : post.$get();
                        }
                        return Post.find({id: slug});
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
                    controller: ['$scope', '$attrs', '$location', function ($scope, $attrs, $location) {
                        $scope.full = $scope.$eval($attrs.postContainer);
                    }]
                };
            }]);
    };
});
