/*global define, require, ga*/

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
                        }]
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
                })

                .when('/404', {
                    templateUrl: '/404.html',
                    controller: [function () {
                        (window.onCaptureReady || angular.noop)(404);
                    }]
                })

                .otherwise({redirectTo: '/404'});
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
                var baseUrl = '/api/posts/:id/:action/:resourceId',
                    Post = $resource(baseUrl, { id: '@id' }, {
                        update: { method: 'PUT' },
                        find: { method: 'GET', params: { action: 'find' } },
                        tag: { method: 'POST', params: { action: 'tags' } },
                        untag: { method: 'DELETE', params: { action: 'tags' } }
                    });

                Post.prototype.getStatusStr = function () {
                    switch (this.status) {
                        case 0:
                            return "unpublished";
                        case 1:
                            return "draft";
                        case 2:
                            return "published";
                    }
                };

                Post.prototype.getRelatedUrl = function () {
                    return baseUrl
                        .replace(':id', this.id)
                        .replace(':action/', 'related')
                        .replace(':resourceId', '');
                };

                Post.prototype.getUrl = function () {
                    return 'http://thomasbelin.fr/posts/' + this.slug;
                };

                return Post;
            }])

            .factory('shareManager', ['$interpolate', function ($interpolate) {
                var providers = {
                    'twitter':  'https://twitter.com/intent/tweet?text={{text}}&url={{url}}&via=ThomasBelin4',
                    'facebook' : 'http://www.facebook.com/share.php?u={{url}}',
                    'google-plus': 'https://plus.google.com/share?url={{url}}'
                };
                return {
                    getShareUrl: function (provider, url, text) {
                        var providerUrlPattern = providers[provider];
                        if (!providerUrlPattern) { return false; }
                        return $interpolate(providerUrlPattern)({url: url, text: text});
                    }
                };
            }])

            .factory('postsManager', ['Post', '$http', function (Post, $http) {
                var posts,
                    relatedPosts = {},
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
                    },

                    getRelated: function (post) {
                        if (!relatedPosts[post.id]) {
                            relatedPosts[post.id] = [];
                            $http
                                .get(post.getRelatedUrl())
                                .success(function (posts) {
                                    Array.prototype.push.apply(relatedPosts[post.id], posts);
                                });
                        }
                        return relatedPosts[post.id];
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
                    }]
                };
            }])

            .directive('wscShare', ['$window', 'shareManager', function ($window, shareManager) {
                return {
                    scope: {
                        resource: '=wscShareResource'
                    },
                    link: function ($scope, element, attrs) {
                        var provider = attrs.wscShare;
                        element.on('click', function (event) {
                            event.preventDefault();
                            $window.open(shareManager.getShareUrl(provider, $scope.resource.getUrl(), $scope.resource.title), '_blank');
                        });
                    }

                };
            }])

            .directive('wscRelatedPosts', ['postsManager', function (postsManager) {
                return {
                    restrict: 'A',
                    scope: true,
                    controller: ['$scope', '$attrs', function ($scope, $attrs) {
                        $scope.$watch($attrs.wscRelatedPosts, function (post) {
                            if (post.id) {
                                $scope.related = postsManager.getRelated(post);
                            }
                        }, true);
                    }]
                };
            }])

            .directive('sticky', ['$window', '$timeout', function ($window, $timeout) {
                return {
                    restrict: 'A',
                    link: function (scope, element) {
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
            }])

            .directive('gaTracker', [function () {
                return {
                    restrict: 'A',
                    link: function (scope, element, attrs) {
                        var datas = scope.$eval(attrs.gaTracker);
                        element.on('click', function () {
                            ga('send', datas.type, datas.category, datas.action, datas.label);
                        });
                    }
                };
            }]);


        app.run(['$rootScope', '$location', function ($rootScope, $location) {
            $rootScope.$on('$routeChangeError', function () {
                if (window.onCaptureReady) {
                    window.onCaptureReady(404);
                } else {
                    $location.url('/404');
                }
            });

            $rootScope.$on('$routeChangeStart', function (e, to, from) {
                if (from) {
                    ga('send', 'pageview', $location.path());
                }
            });
        }]);
    };
});
