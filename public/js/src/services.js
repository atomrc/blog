/*global define, window*/

define(['angular', 'analytics', 'disqus'],
    function (Angular, analytics, Disqus) {
        'use strict';
        var stateManager = null,
            analyticsTracker = null,
            disqus = null,
            Post = null,
            Tag = null,
            Tweet = null,
            services = null;

        stateManager = function ($window, $rootScope) {
            var setTitle = function (event) {
                if (event.targetScope.title) {
                    $window.document.title = event.targetScope.title;
                } else {
                    $window.document.title = "Why So Curious ?";
                }
            };
            $rootScope.$on('$viewContentLoaded', setTitle);
        };

        analyticsTracker = function (location, rootScope) {
            var track = function () {
                analytics.push(['_setAccount', 'UA-34218773-1']);
                analytics.push(['_trackPageview', location.path()]);
            };
            rootScope.$on('$viewContentLoaded', track);
        };

        disqus = ['$location', function ($location) {
            return {
                init: function (post) {
                    Disqus.reset({
                        reload: true,
                        config: function () {
                            this.page.indentifier = post.slug;
                            this.page.url = $location.absUrl();
                        }
                    });
                }
            };
        }];

        Tag = function (resource) {
            return resource('/api/posts/:slug/tags/:tagId', {tagId: '@_id'});
        };

        Post = function (resource) {
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
        };


        Tweet = function (resource) {
            return resource('http://api.twitter.com/1/statuses/user_timeline.json?count=10&include_rts=true&screen_name=thomasbelin4&callback=JSON_CALLBACK',
                {},
                { query: {method: 'JSONP', isArray: true}}
                );
        };

        services = {
            stateManager: ['$window', '$rootScope', stateManager],
            analyticsTracker: ['$location', '$rootScope', analyticsTracker],
            disqus: disqus,
            Tag: ['$resource', Tag],
            Post: ['$resource', Post],
            Tweet: ['$resource', Tweet]
        };
        return services;
    }
);

