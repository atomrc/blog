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
        twitter: 'http://platform.twitter.com/widgets',
        disqus: 'http://whysocurious.disqus.com/embed',
        gplus: 'https://apis.google.com/js/plusone',
        facebook: 'https://connect.facebook.net/fr_FR/all.js#xfbml=1'
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
        },

        gplus: {
            exports: "gapi"
        },

        facebook: {
            exports: "FB"
        },

        twitter: {
            exports: "twttr"
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
        twitter: function () {
            return function (scope, element, attr) {
                require(['twitter'], function (twttr) {
                    window.setTimeout(twttr.widgets.load, 100);
                });
            };
        },

        googleplus: function () {
            return function (scope, element, attr) {
                require(['gplus'], function (gplus) {
                    var i = 0;
                    for (i = 0; i < element.length; i++) {
                        gplus.plusone.render(element[i], {annotation: "bubble", size: "medium", href: scope.location});
                    }
                });
            };
        },

        facebook: function () {
            return function (scope, element, attr) {
                require(['facebook'], function (fb) {
                    var i = 0,
                        fbButton;
                    for (i = 0; i < element.length; i++) {
                        fbButton = window.document.createElement("fb:like");
                        fbButton.setAttribute("href", scope.location);
                        fbButton.setAttribute("layout", "button_count");
                        fbButton.setAttribute("show_faces", "false");
                        fbButton.setAttribute("show_send", "false");
                        fbButton.setAttribute("width", "400");
                        element[i].appendChild(fbButton);
                        fb.XFBML.parse(fbButton);
                    }
                });
            };
        },

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
