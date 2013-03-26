/*global define, window*/

define(['twitter', 'rainbow', 'gplus'],
    function (twttr, rainbow, gplus) {
        'use strict';
        var twitter,
            googleplus,
            codecontainer;

        twitter = function () {
            return function (scope, element, attr) {
                window.setTimeout(twttr.widgets.load, 100);
            };
        };

        googleplus = function () {
            return function (scope, element, attr) {
                var i = 0;
                for (i = 0; i < element.length; i++) {
                    gplus.plusone.render(element[i], {annotation: "bubble", size: "medium", href: scope.escapedLocation});
                }
            };
        };

        codecontainer = function () {
            return function (scope, element, attr) {
                window.setTimeout( function () {
                    rainbow.color(element[0]);
                }, 10);
            };
        };

        return {
            twitter: twitter,
            googleplus: googleplus,
            codecontainer: codecontainer
        };
    }
);

