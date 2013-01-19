/*global define*/

define([],
    function () {
        'use strict';
        var app = { 'apikey': 'felix' },
            TweetsNormalizer = null;

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

        return {
            application: app,
            tweetsNormalizer: function () { return new TweetsNormalizer(); }
        };
    }
);

