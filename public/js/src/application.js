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
            var SocialNetwork = function (url, text) {
                this.init(url, text);
                this.computeCount();
            };
            SocialNetwork.prototype = {
                name: '',
                title: '',
                shareUrlPattern: '',
                countUrlPattern: '',
                countPropertyPath: '',
                init: function (url, text) {
                    var escapedUrl = encodeURIComponent(url);

                    this.shareUrl = $interpolate(this.shareUrlPattern)({
                        url: escapedUrl,
                        text: encodeURIComponent(text)
                    });
                    this.countUrl = $interpolate(this.countUrlPattern)({ url: escapedUrl });
                },

                computeCount: function () {
                    var self = this;
                    if (this.countUrl) {
                        $http({
                            method: 'JSONP',
                            url: this.countUrl
                        }).success(function (response) {
                            self.count = response[self.countPropertyPath];
                        });
                    }
                }
            };

            return SocialNetwork;
        }],

        Twitter: ['SocialNetwork', function (SocialNetwork) {
            var Twitter = function (url, text) {
                SocialNetwork.call(this, url, text);
            };
            Twitter.prototype = Object.create(new SocialNetwork(), {
                title: {value: 'Twitter'},
                name: {value: 'twitter'},
                shareUrlPattern: {value: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}&via=ThomasBelin4'},
                countUrlPattern: {value: 'http://urls.api.twitter.com/1/urls/count.json?url={{url}}&callback=JSON_CALLBACK'},
                countPropertyPath: {value: 'count'}
            });
            return Twitter;
        }],

        Google: ['SocialNetwork', function (SocialNetwork) {
            var Google = function (url, text) {
                SocialNetwork.call(this, url, text);
            };
            Google.prototype = Object.create(new SocialNetwork(), {
                title: {value: 'Google+'},
                name: {value: 'google-plus'},
                shareUrlPattern: {value: 'https://plus.google.com/share?url={{url}}'},
                countUrlPattern: {value: '/api/sharecount/google?url={{url}}&callback=JSON_CALLBACK'},
                countPropertyPath: {value: 'count'},
                computeCount: {value: function () { console.log('todo'); return; }}
            });
            return Google;
        }],

        Facebook: ['SocialNetwork', function (SocialNetwork) {
            var Facebook = function (url, text) {
                SocialNetwork.call(this, url, text);
            };
            Facebook.prototype = Object.create(new SocialNetwork(), {
                title: {value: 'Facebook'},
                name: {value: 'facebook'},
                shareUrlPattern: {value: 'http://www.facebook.com/share.php?u={{url}}'},
                countUrlPattern: {value: 'http://graph.facebook.com/?id={{url}}&callback=JSON_CALLBACK'},
                countPropertyPath: {value: 'shares'}
            });
            return Facebook;
        }],

        shareManager: ['$interpolate', '$http', 'Twitter', 'Google', 'Facebook', function ($interpolate, $http, Twitter, Google, Facebook) {
            return {
                providers: [],
                providersClasses: {
                    'twitter': Twitter,
                    'google-plus' : Google,
                    'facebook': Facebook
                },

                generateProviders: function (url, resource) {
                    //handle caching
                    if (this.providers[url]) { return this.providers[url]; }
                    this.providers[url] = [];
                    var i,
                        provider,
                        ProviderClass;
                    for (i in this.providersClasses) {
                        if (this.providersClasses.hasOwnProperty(i)) {
                            ProviderClass = this.providersClasses[i];
                            provider = new ProviderClass(url, resource.title);
                            this.providers[url].push(provider);
                        }
                    }

                    return this.providers[url];
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

        metaContent: function () {
            return function (scope, element, attrs) {
                var desc = scope.$eval(attrs.metaContent),
                    defaultValue = element.attr('content');
                scope.$watch(attrs.metaContent, function (newValue) {
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

    application.controllers.tweetsController = ['$scope', 'Tweet', function ($scope, Tweet) {
        Tweet.query(function (tweets) {
            $scope.tweets = tweets;
        });
    }];

    application.controllers.homeController = ['$rootScope', '$scope', 'posts', 'Tweet', function ($rootScope, $scope, posts, Tweet) {
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
