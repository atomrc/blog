/*global define, ga*/

define([], function () {
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
                return $resource('/api/posts/:id/:action', { id: '@id' }, {
                    update: { method: 'PUT' },
                    find: { method: 'GET', params: { action: 'find' } },
                    tag: { method: 'POST', params: { action: 'tags' } },
                    untag: { method: 'DELETE', params: { action: 'tags' } }
                });
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
                        if (!post) { return Post.find({id: slug}); }
                        if (post.body) { return post; }
                        post.$loading = true;
                        return post.$get();
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
            }])

            .directive('sticky', ['$window', '$timeout', function ($window, $timeout) {
                return {
                    restrict: 'A',
                    link: function (scope, element, attrs) {
                        var offset = null,
                            isSticky = false;
                        $timeout(function () {
                            offset = element[0].getBoundingClientRect().top;
                        });
                        $window.addEventListener('scroll', function () {
                            if (!offset) { return; }
                            var shouldBeSticky = $window.pageYOffset >= offset;
                            //if the element already has the state it should have
                            if (shouldBeSticky === isSticky) { return; }
                            isSticky = shouldBeSticky;
                            if (shouldBeSticky) {
                                element.addClass('sticky');
                            } else {
                                element.removeClass('sticky');
                            }
                        });
                    }
                };
            }])

            .directive('disqus', ['$location', function ($location) {
                return {
                    restrict: 'A',
                    scope: { resource: '=disqus' },
                    controller: ['$scope', function (scope) {
                        require(['disqus'], function (disqus) {
                            disqus.reset({
                                reload: true,
                                config: function () {
                                    this.page.identifier = scope.resource.slug;
                                    this.page.url = $location.absUrl();
                                    this.page.title = scope.resource.title;
                                }
                            });
                        });
                    }]
                };
            }]);


        app.run(['$rootScope', '$location', function ($rootScope, $location) {
            $rootScope.$on('$routeChangeStart', function (e, to, from) {
                if (from) {
                    ga('send', 'pageview', $location.path());
                }
            });
        }]);
    };
});
