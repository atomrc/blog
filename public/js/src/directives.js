/*global define*/

define(['twitter'],
    function (twttr) {
        'use strict';
        var twitter,
            draggable;

        twitter = function () {
            return function (scope, element, attr) {
                twttr.widgets.load();
            };
        };

        return {
            twitter: twitter
        };
    }
);

