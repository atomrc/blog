/*global require, define, angular, window*/
require.config({
    paths: {
        rainbow: '/js/lib/rainbow.min',
        analytics: 'http://www.google-analytics.com/ga',
        twitter: 'http://platform.twitter.com/widgets',
        disqus: 'http://whysocurious.disqus.com/embed',
        gplus: 'https://apis.google.com/js/plusone'
    },

    shim: {
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

        twitter: {
            exports: "twttr"
        }
    }
});

var services,
    directives,
    controllers,
    routes,
    filters,
    applicationFactory;

/***************************************/
/*************** SERVICES ***************/
/***************************************/
services = {
    stateManager : ['$window', '$rootScope', function ($window, $rootScope) {
        var setTitle = function (event) {
            if (event.targetScope.title) {
                $window.document.title = event.targetScope.title;
            } else {
                $window.document.title = "Why So Curious ?";
            }
        };
        $rootScope.$on('$viewContentLoaded', setTitle);
    }],


    analyticsTracker : ['$location', '$rootScope', function (location, rootScope) {
        require(['analytics'], function (analytics) {
            var track = function () {
                analytics.push(['_setAccount', 'UA-34218773-1']);
                analytics.push(['_trackPageview', location.path()]);
            };
            rootScope.$on('$viewContentLoaded', track);
        });
    }],


    disqus : ['$location', function ($location) {
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


    Tag : ['$resource', function (resource) {
        return resource('/api/posts/:slug/tags/:tagId', {tagId: '@_id'});
    }],


    Post : ['$resource', function (resource) {
        'use strict';
        var Post = resource('/api/posts/:slug', { slug: '@slug' }, { update: { method: 'PUT' }});

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
directives = {
    twitter: function () {
        'use strict';
        return function (scope, element, attr) {
            require(['twitter'], function (twttr) {
                window.setTimeout(twttr.widgets.load, 100);
            });
        };
    },

    googleplus: function () {
        'use strict';
        return function (scope, element, attr) {
            require(['gplus'], function (gplus) {
                var i = 0;
                for (i = 0; i < element.length; i++) {
                    gplus.plusone.render(element[i], {annotation: "bubble", size: "medium", href: scope.location});
                }
            });
        };
    },

    codecontainer: function () {
        'use strict';
        return function (scope, element, attr) {
            require(['rainbow'], function (rainbow) {
                window.setTimeout( function () {
                    rainbow.color(element[0]);
                }, 10);
            });
        };
    }
};


/***************************************/
/*************** FILTERS ***************/
/***************************************/
filters = {
    urlconvert: function () {
        'use strict';
        return function (input) {
            var parsedText = input,
                refReg = /(@[^ ]+)/g,
                linkReg = /(http[s]?:\/\/[^ ]+)/g;
            parsedText = parsedText.replace(refReg, "<span class=\"tweet-ref\">$1</span>");
            parsedText = parsedText.replace(linkReg, "<a href=$1>$1</a>");
            return parsedText;
        };
    }
};


/***************************************/
/*************** ROUTES ***************/
/***************************************/
routes = {
    '/': {
        templateUrl: '/views/home',
        controller: ['$scope', 'posts', 'Tweet', function ($scope, posts, Tweet) {
            $scope.posts = posts;
            Tweet.query(function (tweets) {
                $scope.tweets = tweets;
            });
        }],
        resolve: {
            posts: ['Post', '$q', '$location', function (Post, q, $location) {
                var deferred = q.defer();
                Post.query(function (posts) { deferred.resolve(posts) });
                return deferred.promise;
            }]
        }
    },

    '/posts/:postSlug': {
        templateUrl: '/views/posts_show',

        controller: ['$scope', '$location', 'post', 'disqus', function ($scope, $location, post, disqus) {
            'use strict';
            $scope.title = post.title;
            $scope.post = post;
            $scope.location = $location.absUrl();
            disqus.init(post);
        }],

        resolve: {
            post: ['Post', '$route', '$q', '$location', function (Post, route, q, $location) {
                'use strict';
                var deferred = q.defer();
                Post.get({slug: route.current.params.postSlug}, function (post) {
                    deferred.resolve(post);
                },
                function () { $location.url('/404'); });
                return deferred.promise;
            }]
        }
    },

    '/404': {
        templateUrl: 'views/404'
    }
};

applicationFactory = function (Angular, services, routes, directives, filters) {
    'use strict';
    var application = {
        module: null,

        init: function () {
            this.initModules();
            this.initDirectives();
            this.initFilters();
            this.initRoutes();
        },

        initModules: function () {
            this.module = Angular.module('blog', ['ngResource', 'ngSanitize'], ['$provide', function ($provide) {
                for (var service in services) {
                    $provide.factory(service, services[service]);
                }
            }]).run(['analyticsTracker', 'stateManager', function () {}]);
        },

        initDirectives: function () {
            for(var directive in directives) {
                this.module.directive(directive, directives[directive]);
            }
        },

        initFilters: function () {
            for(var filter in filters) {
                this.module.filter(filter, filters[filter]);
            }
        },

        initRoutes: function () {
            this.module.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
                $locationProvider.html5Mode(true);
                for (var route in routes) {
                    $routeProvider.when(route, routes[route]);
                }
                $routeProvider.otherwise({redirectTo: '/404'});
            }]);
        },

        run: function () {
            Angular.bootstrap(window.document, ['blog']);
        }
    };

    return application;
}
