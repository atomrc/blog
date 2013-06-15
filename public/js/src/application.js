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
            rootScope.$on('$routeChangeError', function () {
                $location.url('/404');
            });
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

        postsManager: ['Post', '$q', function (Post, q) {
            return {
                posts: [],

                query: function () {
                    if (this.posts.length > 0) { return this.posts; } //caching
                    this.posts = Post.query();
                    return this.posts;
                },

                get: function (slug) {
                    if (!slug) { return new Post(); }
                    var deferred = q.defer();
                    Post.get(
                        { slug: slug },
                        function (post) { deferred.resolve(post); },
                        function (response) { deferred.reject('not found'); }
                    );
                    return deferred.promise;
                }
            };
        }],

        Tag: ['$resource', function (resource) {
            return resource('/api/posts/:slug/tags/:tagId', {tagId: '@_id'});
        }],

        Post: ['$resource', function (resource) {
            var Post = resource('/api/posts/:slug/:action', { slug: '@slug' }, {
                update: { method: 'PUT' },
                reset: { method: 'PUT', params: { action: 'reset'} }
            });
            return Post;
        }],

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
        sticky: ['$window', '$compile', function ($window, $compile) {
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
                                this.page.indentifier = scope.resource.slug;
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
        }]
    };


    /***************************************/
    /*************** FILTERS ***************/
    /***************************************/
    application.filters = {};

    /***************************************/
    /*************** CONTROLLERS ***************/
    /***************************************/
    application.controllers.shareController = ['$scope', '$location', '$window', 'shareManager', function ($scope, $location, $window, shareManager) {
        $scope.setResource = function (resource) {
            $scope.resource = resource;
            $scope.providers = shareManager.generateProviders($location.absUrl(), $scope.resource);
        };

        $scope.share = function (provider) {
            var url = provider.shareUrl,
                width = 500,
                height = 500,
                left = ($window.screen.width / 2) - (width / 2),
                top = ($window.screen.height / 2) - (height / 2);
            return $window.open(url, 'share', 'width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
        };
    }];

    application.controllers.homeController = ['$rootScope', '$scope', 'posts', function ($rootScope, $scope, posts) {
        $rootScope.description = null;
        $rootScope.title = null;

        $scope.posts = posts;
    }];

    application.controllers.showController = ['$rootScope', '$scope', '$location', 'post', function ($rootScope, $scope, $location, post) {
        $rootScope.description = post.description;
        $rootScope.title = post.title;

        $scope.post = post;
    }];

    application.controllers.postController = [function () {}];
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
                post: ['postsManager', '$route', '$location', function (postsManager, route, $location) {
                    return postsManager.get(route.current.params.postSlug);
                }]
            }
        },

        '/404': {
            templateUrl: '/views/404'
        }
    };

    return application;

}());
