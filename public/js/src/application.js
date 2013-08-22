/*global require, define, angular, window*/
/*jslint plusplus: true*/
var Blog = (function () {
    'use strict';
    var application = {
        services: {},
        directives: {},
        controllers: {},
        routes: {},
        filters: {}
    };

    /***************************************/
    /*************** SERVICES ***************/
    /***************************************/
    application.services = {

        analyticsTracker: ['$location', '$rootScope', function (location, rootScope) {
            require(['analytics'], function (analytics) {
                var track = function () {
                    analytics.push(['_setAccount', 'UA-34218773-1']);
                    analytics.push(['_trackPageview', location.path()]);
                };
                rootScope.$on('$viewContentLoaded', track);
            });
        }],

        errorHandler: ['$rootScope', '$location', function (rootScope, $location) {
            var errorFn = function () {
                (window.onCaptureReady || angular.noop)(404);
                $location.url('/404');
            };
            rootScope.$on('$routeChangeError', errorFn);
            rootScope.$on('loadError', errorFn);
        }],

        SocialNetwork:  ['$http', '$interpolate', function ($http, $interpolate) {
            var SocialNetwork = function (settings) {
                this.name = settings.name;
                this.title = settings.title;
                this.shareUrlPattern = settings.shareUrl;
                this.countPath = settings.countPath;
            };
            SocialNetwork.prototype = {
                name: '',
                title: '',
                shareUrlPattern: '',
                shareUrl: '',
                init: function (url, text) {
                    var escapedUrl = encodeURIComponent(url);
                    this.shareUrl = $interpolate(this.shareUrlPattern)({
                        url: escapedUrl,
                        text: encodeURIComponent(text)
                    });
                },

                extractCount: function (allCounts) {
                    var splittedPath = this.countPath.split('.'),
                        i = 0,
                        pathDepth = splittedPath.length,
                        tmp = allCounts;
                    for (i; i < pathDepth; i++) {
                        tmp = tmp[splittedPath[i]];
                    }
                    this.count = tmp;
                }
            };

            return SocialNetwork;
        }],

        shareManager: ['$interpolate', '$http', 'SocialNetwork', function ($interpolate, $http, SocialNetwork) {
            return {
                providers: [],
                providersSettings: {
                    'twitter': {
                        name: 'twitter',
                        title: 'Twitter',
                        shareUrl: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}&via=ThomasBelin4',
                        countPath: 'Twitter'
                    },
                    'facebook' : {
                        name: 'facebook',
                        title: 'Facebook',
                        shareUrl: 'http://www.facebook.com/share.php?u={{url}}',
                        countPath: 'Facebook.total_count'
                    },
                    'google-plus': {
                        name: 'google-plus',
                        title: 'Google+',
                        shareUrl: 'https://plus.google.com/share?url={{url}}',
                        countPath: 'GooglePlusOne'
                    }
                },

                generateProviders: function (url, resource) {
                    //handle caching
                    if (this.providers[url]) { return this.providers[url]; }
                    this.providers[url] = [];
                    var i,
                        provider,
                        providerSetting;
                    for (i in this.providersSettings) {
                        if (this.providersSettings.hasOwnProperty(i)) {
                            providerSetting = this.providersSettings[i];
                            provider = new SocialNetwork(providerSetting);
                            provider.init(url, resource.title);
                            this.providers[url].push(provider);
                        }
                    }
                    this.initShareCounts(url, this.providers[url]);

                    return this.providers[url];
                },

                initShareCounts: function (url, providers) {
                    var countUrlPattern = 'http://api.sharedcount.com/?url={{url}}&callback=JSON_CALLBACK',
                        countUrl = $interpolate(countUrlPattern)({ url: encodeURIComponent(url) });
                    $http.jsonp(countUrl).success(function (response) {
                        var pro,
                            count;
                        for (pro in providers) {
                            if (providers.hasOwnProperty(pro)) {
                                providers[pro].extractCount(response);
                            }
                        }
                    });
                }

            };
        }],

        metadatasManager: ['$http', function ($http) {
            return {
                metadatas: {}, //will contain all the metadatas of the posts (like share counts and comments count)

                loadForResources: function (posts) {
                    var threads = posts.map(function (post) {
                        return 'link:' + post.getUrl();
                    }),
                        self = this;

                    $http.jsonp("https://disqus.com/api/3.0/threads/set.jsonp?callback=JSON_CALLBACK", {
                        params: {
                            api_key: 'HSs49FHL75L8CTUpuVWmGqpFcgshtj5J2AaSBbklu3vRS92ysEnKYn5gjPX12Qcx',
                            forum : 'whysocurious',
                            thread: threads
                        },
                        cache: true
                    }).success(function (datas) {
                        angular.forEach(datas.response, function (thread) {
                            angular.forEach(thread.identifiers, function (slug) {
                                this.metadatas[slug] = { commentCount: thread.posts };
                            }, this);
                        }, self);
                    });

                    return this.metadatas;
                }

            };
        }],

        postsManager: ['Post', '$q', '$timeout', function (Post, q, timeout) {
            return {
                posts: [],

                query: function () {
                    if (this.posts.length > 0) { return this.posts; } //caching
                    this.posts = Post.query();
                    return this.posts.$promise;
                },

                getInCache: function (slug) {
                    if (this.posts.length === 0) { return null; }
                    return (this.posts.filter(function (post) { return post.slug === slug; }) || [])[0];
                },

                isFullyLoaded: function (post) {
                    return post && post.body;
                },

                getById: function (id) {
                    return Post.get({ id: id }).$promise;
                },

                get: function (slug) {
                    var post = this.getInCache(slug);
                    if (this.isFullyLoaded(post)) {
                        return post;
                    }
                    if (post) {
                        return post.$get();
                    }
                    return Post.find({ id: slug }).$promise;
                }
            };
        }],

        Tag: ['$resource', function (resource) {
            return resource('/api/tags/:id', {id: '@_id'});
        }],

        Post: ['$resource', '$location', function (resource, $location) {
            var baseUrl = '/api/posts/:id/:action/:resourceId',
                Post = resource(baseUrl, { id: '@_id' }, {
                    update: { method: 'PUT' },
                    find: { method: 'GET', params: { action: 'find' } },
                    tag: { method: 'POST', params: { action: 'tags' } },
                    untag: { method: 'DELETE', params: { action: 'tags' } }
                });

            Post.prototype.getUrl = function () {
                return 'http://' + $location.$$host + ($location.$$port !== 80 ? ':' + $location.$$port : '') + '/posts/' + this.slug;
            };

            Post.prototype.hasTag = function (tag) {
                return tag && this.tags.reduce(function (value, element) {
                    return value || element._id === tag._id;
                }, false);
            };

            return Post;
        }]

    };


    /***************************************/
    /*************** DIRECTIVES ***************/
    /***************************************/
    application.directives = {

        metaContent: function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var desc = scope.$eval(attrs.metaContent),
                        defaultValue = element.attr('content');
                    scope.$watch(attrs.metaContent, function (newValue) {
                        if (newValue) {
                            element.attr('content', newValue);
                        } else {
                            element.attr('content', defaultValue);
                        }
                    });
                }
            };
        },

        // add a sticky header on top of the window that shows when the user scroll to a specific position
        sticky: ['$window', function ($window) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var options = scope.$eval(attrs.sticky),
                        isSticky = false;
                    if (!options) { return; }
                    element.addClass('sticky hidden');
                    $window.onscroll = function () {
                        var shouldBeSticky = $window.pageYOffset >= options.start;
                        if (shouldBeSticky === isSticky) { return; }

                        if (shouldBeSticky) {
                            element.removeClass('hidden');
                        } else {
                            element.addClass('hidden');
                        }

                        isSticky = shouldBeSticky;
                    };
                }
            };
        }],

        //the disqus container
        disqus: ['$location', function ($location) {
            return {
                restrict: 'A',
                scope: { resource: '=disqus' },
                link: function (scope, element, attrs) {
                    require(['disqus'], function (Disqus) {
                        Disqus.reset({
                            reload: true,
                            config: function () {
                                this.page.identifier = scope.resource.slug;
                                this.page.url = $location.absUrl();
                            }
                        });
                    });
                }
            };
        }],

        codecontainer: ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    require(['rainbow'], function (rainbow) {
                        $timeout(function () { rainbow.color(element[0]); }, 0);
                    });
                }
            };
        }],

        postsContainer: ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                scope: { posts: '=postsContainer' },
                controller: 'postsController'
            };
        }],

        share: [function () {
            return {
                restrict: 'A',
                scope: { resource: "=share" },
                controller: 'shareController'
            };
        }],

        routeLoader: ['$rootScope', function (rootScope) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.loading = false;
                    rootScope.$on('$routeChangeStart', function () {
                        scope.loading = true;
                    });
                    rootScope.$on('$routeChangeSuccess', function () {
                        scope.loading = false;
                    });
                }
            };
        }]
    };

    /***************************************/
    /*************** ANIMATIONS ***************/
    /***************************************/
    application.animations = {};

    /***************************************/
    /*************** FILTERS ***************/
    /***************************************/
    application.filters = {};

    /***************************************/
    /*************** CONTROLLERS ***************/
    /***************************************/

    application.controllers.homeController = ['$rootScope', '$scope', 'posts', function ($rootScope, $scope, posts) {
        $rootScope.description = null;
        $rootScope.title = null;

        $scope.posts = posts;
    }];

    application.controllers.showController = ['$rootScope', '$scope', 'post', '$sce', function ($rootScope, $scope, post, sce) {
        $rootScope.description = post.description;
        $rootScope.title = post.title;

        post.$body = post.$body || sce.trustAsHtml(post.body);
        $scope.post = post;
    }];

    application.controllers.postsController = ['$scope', '$location', 'metadatasManager', function ($scope, $location, metadatasManager) {

        $scope.setHoveredTag = function (tag) {
            $scope.hoveredTag = tag;
        };

        $scope.show = function (post) {
            $location.path('/posts/' + post.slug);
        };

        $scope.posts.$promise.then(function () {
            $scope.metadatas = metadatasManager.loadForResources($scope.posts);
        });

    }];

    application.controllers.shareController = ['$scope', '$location', '$window', 'shareManager', function ($scope, $location, $window, shareManager) {
        $scope.providers = shareManager.generateProviders($location.absUrl(), $scope.resource);

        $scope.share = function (provider) {
            var url = provider.shareUrl,
                width = 500,
                height = 500,
                left = ($window.screen.width / 2) - (width / 2),
                top = ($window.screen.height / 2) - (height / 2);
            return $window.open(url, 'share', 'width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
        };
    }];

    application.controllers.tagsController = [function () {}];

    /***************************************/
    /*************** ROUTES ***************/
    /***************************************/
    application.routes = {
        '/': {
            templateUrl: '/views/home',
            controller: 'homeController',
            resolve: {
                posts: ['postsManager', function (postsManager) {
                    return postsManager.query();
                }]
            }
        },

        '/posts/:postSlug': {
            templateUrl: '/views/posts_show',
            controller: 'showController',
            resolve: {
                post: ['$route', 'postsManager', function (route, postsManager) {
                    return postsManager.get(route.current.params.postSlug);
                }]
            }
        },

        '/posts/:postId/preview': {
            templateUrl: '/views/posts_show',
            controller: 'showController',
            resolve: {
                post: ['$route', 'postsManager', function (route, postsManager) {
                    return postsManager.getById(route.current.params.postId);
                }]
            }
        },

        '/404': {
            templateUrl: '/views/404',
            controller: [function () {
                (window.onCaptureReady || angular.noop)(404);
            }]
        }
    };

    return application;

}());
