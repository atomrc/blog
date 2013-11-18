/*global module, window*/
/*jslint plusplus: true*/

module.exports = function (app) {
    'use strict';

    app.factory('tracker', ['$location', function (location) {
        var analytics = null,
            buffer = [],

            track = function (element) {
                if (!analytics) {
                    console.log(element);
                    return buffer.push(element);
                }
                analytics.push(['_setAccount', 'UA-34218773-1']);
                analytics.push(element);
            },

            flushBuffer = function () {
                buffer.forEach(function (element) {
                    track(element);
                });
                buffer = [];
            };

        if (location.host() !== 'localhost') {
            require(['analytics'], function (analyticsTracker) {
                analytics = analyticsTracker;
                flushBuffer();
            });
        }

        return {
            trackPage: function (path) {
                track(['_trackPageview', path]);
            },

            trackEvent: function (category, action, label) {
                track(['_trackEvent', category, action, label]);
            }
        };
    }]);

    app.factory('pageTracker', ['$location', '$rootScope', 'tracker', function (location, rootScope, tracker) {
        rootScope.$on('$viewContentLoaded', function () {
            tracker.trackPage(location.path());
        });
    }]);

    app.factory('errorHandler', ['$rootScope', '$location', function (rootScope, $location) {
        var errorFn = function () {
            (window.onCaptureReady || angular.noop)(404);
            $location.url('/404');
        };
        rootScope.$on('$routeChangeError', errorFn);
        rootScope.$on('loadError', errorFn);
    }]);

    app.factory('SocialNetwork',  ['$http', '$interpolate', function ($http, $interpolate) {
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
    }]);

    app.factory('shareManager', ['$interpolate', '$http', 'SocialNetwork', function ($interpolate, $http, SocialNetwork) {
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
    }]);

    app.factory('metadatasManager', ['$http', function ($http) {
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
    }]);

    app.factory('postsManager', ['Post', '$q', '$timeout', '$http', function (Post, q, timeout, http) {
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
            },

            getRelated: function (post) {
                return http
                    .get('/api/posts/' + post.id + '/related');
            }
        };
    }]);

    app.factory('Tag', ['$resource', function (resource) {
        return resource('/api/tags/:id', {id: '@id'});
    }]);

    app.factory('Post', ['$resource', '$location', function (resource, $location) {
        var baseUrl = '/api/posts/:id/:action/:resourceId',
            Post = resource(baseUrl, { id: '@id' }, {
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
                return value || element.id === tag.id;
            }, false);
        };

        return Post;
    }]);
};
