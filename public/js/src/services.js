/*global define*/

define(['angular'],
    function (Angular) {
        'use strict';
        var TweetsNormalizer = null,
            SnapshotManager = null;

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
                    refReg = /(@[^ ]+)/,
                    linkReg = /(http:\/\/[^ ]+)/;
                parsedText = parsedText.replace(refReg, "<span class=\"tweet-ref\">$1</span>");
                parsedText = parsedText.replace(linkReg, "<a href=$1>$1</a>");

                return { text: parsedText };

            }
        };

        SnapshotManager = function ($http, $window) {
            this.http = $http;
            this.window = $window;
        };
        SnapshotManager.prototype = {
            takeSnapshot: function () {
                var snap = function () {
                    var content = Angular.element(this.window.document.documentElement);
                    this.http.post('/snapshot', { 'html': content.html(), 'page': this.window.document.location.hash });
                }.bind(this);
                this.window.setTimeout(snap, 1000);
            }
        };

        var services = {
            tweetsNormalizer: function () { return new TweetsNormalizer(); },
            snapshotManager: function ($http, $window) { return new SnapshotManager($http, $window); }
        };
        services.snapshotManager.$inject = ['$http', '$window'];
        return services;
    }
);

