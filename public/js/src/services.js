/*global define, window*/

define(['angular', 'analytics'],
    function (Angular, analytics) {
        'use strict';
        var TweetsNormalizer = null,
            StateManager = null,
            AnalyticsTracker = null,
            Comment = null,
            Post = null,
            Tweet = null;

        TweetsNormalizer = function () { };
        TweetsNormalizer.prototype = {

            normalize: function (tweets) {
                var i = 0,
                    parsedTweets = [],
                    tweet = null;
                for (i = 0; i < tweets.length; i++) {
                    tweet = tweets[i];
                    parsedTweets.push(this.normalizeSingle(tweet));
                }
                return parsedTweets;
            },

            normalizeSingle: function (tweet) {
                var parsedText = tweet.text,
                    refReg = /(@[^ ]+)/g,
                    linkReg = /(http[s]?:\/\/[^ ]+)/g;
                parsedText = parsedText.replace(refReg, "<span class=\"tweet-ref\">$1</span>");
                parsedText = parsedText.replace(linkReg, "<a href=$1>$1</a>");

                return { text: parsedText };

            }
        };


        StateManager = function ($http, $window, $rootScope) {
            this.http = $http;
            this.window = $window;
            $rootScope.$on('$viewContentLoaded', function (event) {
                if (event.targetScope.post) {
                    this.window.document.title = event.targetScope.post.title;
                } else {
                    this.window.document.title = "Why So Curious ?";
                }
                window.setTimeout(this.takeSnapshot.bind(this), 1000);
            }.bind(this));
        };
        StateManager.prototype = {
            takeSnapshot: function (event) {
                var content = Angular.element(this.window.document.documentElement);
                var url = this.window.document.location.hash.replace('!', '');
                this.http.post('/snapshot', { 'html': content.html(), 'page': url });
            }
        };


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

        Comment = function (resource) {
            return resource('/posts/:slug/comments/:commentId', {commentId: '@_id'});
        };

        Post = function (resource, Comment) {
            var Post = resource('/posts/:slug', { slug: '@slug' }, { update: { method: 'PUT' }});

            Post.prototype.addComment = function (comment) {
                var com = new Comment(comment);
                com.$save({slug: this.slug}, function (newComment) {
                    this.comments.push(newComment);
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

        var services = {
            tweetsNormalizer: function () { return new TweetsNormalizer(); },
            stateManager: ['$http', '$window', '$rootScope', function (felix, $window, $rootScope) { return new StateManager(felix, $window, $rootScope); }],
            analyticsTracker: ['$location', '$rootScope', function (location, rootScope) { return new AnalyticsTracker(location, rootScope); }],
            Comment: ['$resource', Comment],
            Post: ['$resource', 'Comment', Post],
            Tweet: ['$resource', Tweet]
        };
        return services;
    }
);

