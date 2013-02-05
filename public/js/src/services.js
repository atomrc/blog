/*global define, window*/

define(['angular', 'analytics'],
    function (Angular, analytics) {
        'use strict';
        var TweetsNormalizer = null,
            SnapshotManager = null,
            AnalyticsTracker = null;

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

        SnapshotManager = function ($http, $window, $rootScope) {
            this.http = $http;
            this.window = $window;
            $rootScope.$on('$viewContentLoaded', function () {
                window.setTimeout(this.takeSnapshot.bind(this), 1000);
            }.bind(this));
        };
        SnapshotManager.prototype = {
            takeSnapshot: function () {
                var content = Angular.element(this.window.document.documentElement);
                var url = this.window.document.location.hash.replace('!', '');
                this.http.post('/snapshot', { 'html': content.html(), 'page': url });
            }
        };

        AnalyticsTracker = function ($location, $rootScope) {
            this.location = $location;
            $rootScope.$on('$viewContentLoaded', this.track.bind(this));
        };
        AnalyticsTracker.prototype = {
            track: function () {
                analytics.push(['_setAccount', 'UA-34218773-1']);
                analytics.push(['_trackPageview', this.location.path()]);
            }
        };

        var services = {
            tweetsNormalizer: function () { return new TweetsNormalizer(); },
            snapshotManager: function ($http, $window, $rootScope) { return new SnapshotManager($http, $window, $rootScope); },
            analyticsTracker: function ($location, $rootScope) { return new AnalyticsTracker($location, $rootScope); }
        };
        services.snapshotManager.$inject = ['$http', '$window', '$rootScope'];
        services.analyticsTracker.$inject = ['$location', '$rootScope'];
        return services;
    }
);

