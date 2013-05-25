/*global require, define, angular, window*/
/*jslint plusplus: true*/

if (!window.angular) {
    //require(['angular', 'requirejslib', 'ngSanitize', 'ngResource']);
}

require.config({
    baseUrl: '/',
    paths: {
        requirejslib: './js/lib/require.min',
        angular: './js/lib/angular.min',
        ngResource: './js/lib/angular.resource.min',
        ngSanitize: './js/lib/angular.sanitize.min',
        rainbow: './js/lib/rainbow.min',
        analytics: 'http://www.google-analytics.com/ga',
        disqus: 'http://whysocurious.disqus.com/embed'
    },

    shim: {
        angular: {
            exports: "angular"
        },

        analytics: {
            exports: "_gaq"
        },

        rainbow: {
            exports: "Rainbow"
        },

        disqus: {
            exports: "DISQUS"
        }
    }
});


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
        stateManager: ['$window', '$rootScope', function ($window, $rootScope) {
            var setTitle = function (event) {
                if (event.targetScope.title) {
                    $window.document.title = event.targetScope.title;
                } else {
                    $window.document.title = "Why So Curious ?";
                }
            };
            $rootScope.$on('$viewContentLoaded', setTitle);
        }],


        analyticsTracker: ['$location', '$rootScope', function (location, rootScope) {
            require(['analytics'], function (analytics) {
                var track = function () {
                    analytics.push(['_setAccount', 'UA-34218773-1']);
                    analytics.push(['_trackPageview', location.path()]);
                };
                rootScope.$on('$viewContentLoaded', track);
            });
        }],


        disqus: ['$location', function ($location) {
            return {
                init: function (post) {
                    require(['disqus'], function (Disqus) {
                        Disqus.reset({
                            reload: true,
                            config: function () {
                                this.page.indentifier = post.slug;
                                this.page.url = $location.absUrl();
                            }
                        });
                    });
                }
            };
        }],

        shareManager: ['$interpolate', '$http', function ($interpolate, $http) {
            return {
                getCountUrl: function (provider) {
                    var url = '';
                    switch (provider) {
                    case 'twitter':
                        url = 'http://urls.api.twitter.com/1/urls/count.json?url={{link}}&callback=JSON_CALLBACK';
                        break;
                    case 'facebook':
                        url = false;
                        break;
                    case 'googleplus':
                        url = false;
                        break;
                    }
                    return $interpolate(url);
                },

                getShareUrl: function (provider) {
                    var url = '';
                    switch (provider) {
                    case 'twitter':
                        url = 'https://twitter.com/intent/tweet?text={{text}}&url={{link}}&via=ThomasBelin4';
                        break;
                    case 'facebook':
                        url = 'http://www.facebook.com/share.php?u={{link}}';
                        break;
                    case 'googleplus':
                        url = 'https://plus.google.com/share?url={{link}}';
                        break;
                    }
                    return $interpolate(url);
                },

                getCount: function (provider, url) {
                    var countUrl = this.getCountUrl(provider),
                        fullCountUrl = countUrl({link: encodeURIComponent(url)});
                    if (!fullCountUrl) { return; }
                    return $http({
                        method: 'JSONP',
                        url: fullCountUrl
                    });
                },

                generateLink: function (provider, post, url) {
                    var text = encodeURIComponent(post.title),
                        shareUrl = this.getShareUrl(provider, url),
                        href = '',
                        link = encodeURIComponent(url);
                    return shareUrl({ text: text, link: link });
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

        // add a sticky header on top of the window that shows when the user scroll to a specific position
        sticky: ['$window', '$compile', function ($window, $compile) {
            return function (scope, element, attrs) {
                var options = scope.$eval(attrs.sticky),
                    isSticky = false,
                    clone = element.clone();
                clone.addClass('sticky hidden');
                clone.removeAttr('data-sticky');
                element.parent().append($compile(clone)(scope));
                $window.onscroll = function () {
                    var shouldBeSticky = $window.pageYOffset >= options.start;
                    if (shouldBeSticky === isSticky) { return; }

                    if (shouldBeSticky) {
                        clone.removeClass('hidden');
                    } else {
                        clone.addClass('hidden');
                    }

                    isSticky = shouldBeSticky;
                };
            };
        }],

        socialButton: ['$window', '$location', 'shareManager', function ($window, $location, shareManager) {
            return function (scope, element, attrs) {
                var options = scope.$eval(attrs.socialButton),
                    href = shareManager.generateLink(options.provider, options.resource, $location.absUrl()),
                    countRequest = shareManager.getCount(options.provider, $location.absUrl());
                if (countRequest) {
                    countRequest.success(function (response) {
                        scope.shareCount = response;
                    });
                }
                element.attr('href', href);
                element.attr('onclick', 'return false;');
                element.bind('click', function () {
                    var url = element.attr('href'),
                        width = 500,
                        height = 500,
                        left = ($window.screen.width / 2) - (width / 2),
                        top = ($window.screen.height / 2) - (height / 2);
                    return $window.open(url, 'share', 'width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
                });
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
    /*************** ROUTES ***************/
    /***************************************/
    application.routes = {
        '/': {
            templateUrl: '/views/home',
            controller: ['$scope', 'posts', 'Tweet', function ($scope, posts, Tweet) {
                $scope.posts = posts;
                Tweet.query(function (tweets) {
                    $scope.tweets = tweets;
                });
            }],
            resolve: {
                posts: ['$rootScope', 'Post', function ($rootScope, Post) {
                    if ($rootScope.posts) { return $rootScope.posts; } //caching
                    $rootScope.posts = Post.query();
                    return $rootScope.posts;
                }]
            }
        },

        '/posts/:postSlug': {
            templateUrl: '/views/posts_show',

            controller: ['$scope', '$location', 'post', 'disqus', function ($scope, $location, post, disqus) {
                $scope.title = post.title;
                $scope.post = post;
                $scope.location = $location.absUrl();
                //disqus.init(post);
            }],

            resolve: {
                post: ['Post', '$route', '$q', '$location', function (Post, route, q, $location) {
                    var deferred = q.defer();
                    Post.get(
                        {slug: route.current.params.postSlug},
                        function (post) {
                            deferred.resolve(post);
                        },
                        function () {
                            $location.url('/404');
                        }
                    );
                    return deferred.promise;
                }]
            }
        },

        '/404': {
            templateUrl: '/views/404'
        }
    };

    return application;

}());
