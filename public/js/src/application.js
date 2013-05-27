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

        shareManager: ['$interpolate', '$http', function ($interpolate, $http) {
            return {
                providers: [],
                providersSetting: {
                    'twitter': {
                        title: 'Twitter',
                        shareUrl: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}&via=ThomasBelin4',
                        countUrl: 'http://urls.api.twitter.com/1/urls/count.json?url={{url}}&callback=JSON_CALLBACK',
                        countPropertyPath: 'count'
                    },
                    'google-plus' : {
                        title: 'Google+',
                        shareUrl: 'https://plus.google.com/share?url={{url}}',
                        countUrl: false
                    },
                    'facebook': {
                        title: 'Facebook',
                        shareUrl: 'http://www.facebook.com/share.php?u={{url}}',
                        countUrl: 'http://graph.facebook.com/?id={{url}}&callback=JSON_CALLBACK',
                        countPropertyPath: 'shares'
                    }
                },

                initWithUrl: function (providerSetting, url, resource) {
                    var escapedUrl = encodeURIComponent(url),
                        shareUrl = $interpolate(providerSetting.shareUrl)({
                            url: escapedUrl,
                            text: encodeURIComponent(resource.title)
                        }),
                        countUrl = $interpolate(providerSetting.countUrl)({ url: escapedUrl });
                    return {
                        title: providerSetting.title,
                        shareUrl: shareUrl,
                        countUrl: countUrl,
                        countPropertyPath: providerSetting.countPropertyPath
                    };
                },

                getProvidersForResource: function (url, resource) {
                    //handle caching
                    if (this.providers[url]) { return this.providers[url]; }
                    var i = 0,
                        providers = [],
                        providerSetting;
                    for(i in this.providersSetting) {
                        providerSetting = this.initWithUrl(this.providersSetting[i], url, resource);
                        (function (provider, name) {
                            var filledProvider = {
                                title: provider.title,
                                name: name,
                                shareUrl: provider.shareUrl,
                                count: ''
                            };
                            providers.push(filledProvider);
                            if (provider.countUrl) {
                                $http({
                                    method: 'JSONP',
                                    url: provider.countUrl
                                }).success(function (response) {
                                    filledProvider.count = response[provider.countPropertyPath];
                                });
                            }
                        }(providerSetting, i));
                    }
                    this.providers[url] = providers;

                    return providers;
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

            Post.prototype.addTag = function (tag) {
                tag.$save({slug: this.slug}, function (newTag) {
                    this.tags.push(newTag);
                }.bind(this));
            };

            Post.prototype.publish = function () {
                this.published = !this.published;
                this.$save();
            };
            return Post;
        }],

        Tweet : ['$resource', function (resource) {
            return resource('http://api.twitter.com/1/statuses/user_timeline.json?count=10&include_rts=true&screen_name=thomasbelin4&callback=JSON_CALLBACK',
                {},
                { query: {method: 'JSONP', isArray: true}}
                );
        }]
    };


    /***************************************/
    /*************** DIRECTIVES ***************/
    /***************************************/
    application.directives = {

        metaDescription: function () {
            return function (scope, element, attrs) {
                var desc = scope.$eval(attrs.metaDesciption),
                    defaultValue = element.attr('content');
                scope.$watch(attrs.metaDescription, function (newValue) {
                    if (newValue) {
                        element.attr('content', newValue);
                    } else {
                        element.attr('content', defaultValue);
                    }
                });
            };
        },

        // add a sticky header on top of the window that shows when the user scroll to a specific position
        sticky: ['$window', '$compile', function ($window, $compile) {
            return function (scope, element, attrs) {
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

        codecontainer: function () {
            return function (scope, element, attr) {
                require(['rainbow'], function (rainbow) {
                    window.setTimeout(function () {
                        rainbow.color(element[0]);
                    }, 10);
                });
            };
        }
    };


    /***************************************/
    /*************** FILTERS ***************/
    /***************************************/
    application.filters = {
        twitterRefs: function () {
            return function (input) {
                var parsedText = input,
                    refReg = /(@[^ ]+)/g;
                parsedText = parsedText.replace(refReg, "<span class=\"tweet-ref\">$1</span>");
                return parsedText;
            };
        }
    };

    /***************************************/
    /*************** CONTROLLERS ***************/
    /***************************************/
    application.controllers.shareController = ['$scope', '$location', '$window', 'shareManager', function ($scope, $location, $window, shareManager) {
        $scope.setResource = function (resource) {
            $scope.resource = resource;
            $scope.providers = shareManager.getProvidersForResource($location.absUrl(), $scope.resource);
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

    application.controllers.homeController = ['$rootScope', '$scope', 'posts', 'Tweet', function ($rootScope, $scope, posts, Tweet) {
        $rootScope.description = null;
        $rootScope.title = null;

        $scope.posts = posts;
        Tweet.query(function (tweets) {
            $scope.tweets = tweets;
        });
    }];

    application.controllers.postController = ['$rootScope', '$scope', '$location', 'post', function ($rootScope, $scope, $location, post) {
        $rootScope.description = post.description;
        $rootScope.title = post.title;

        $scope.post = post;
    }];

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
            controller: 'postController',
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
