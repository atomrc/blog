/*global define*/

define(['twitter', 'disqus'],
    function (twttr, disqus) {
        'use strict';
        var twitter,
            draggable;

        twitter = function () {
            return function (scope, element, attr) {
                window.setTimeout(twttr.widgets.load, 100);
            };
        };

        return {
            twitter: twitter
        };
    }
);

