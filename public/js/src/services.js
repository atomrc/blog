/*global define, window*/

define(['angular', 'analytics', 'disqus'],
    function (Angular, analytics, Disqus) {
        'use strict';
        var TweetsNormalizer = null,
            AnalyticsTracker = null,
            disqus = null,
            Post = null,
            Tag = null,
            Tweet = null,
            services = null;

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

        AnalyticsTracker = function (location, rootScope) {
            this.location = location;
            rootScope.$on('$viewContentLoaded', this.track.bind(this));
        };
        AnalyticsTracker.prototype = {
            track: function () {
                analytics.push(['_setAccount', 'UA-34218773-1']);
                analytics.push(['_trackPageview', this.location.path()]);
            }
        };

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
            analyticsTracker: ['$location', '$rootScope', function (location, rootScope) { return new AnalyticsTracker(location, rootScope); }],
            disqus: disqus,
            Tag: ['$resource', Tag],
            Post: ['$resource', Post],
            Tweet: ['$resource', Tweet]
        };
        return services;
    }
);

