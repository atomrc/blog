/*global define*/

define(['twitter', 'rainbow'],
    function (twttr, rainbow) {
        'use strict';
        var twitter,
            codecontainer;

        twitter = function () {
            return function (scope, element, attr) {
                window.setTimeout(twttr.widgets.load, 100);
            };
        };

        codecontainer = function () {
            return function (scope, element, attr) {
                setTimeout( function () {
                    rainbow.color(element[0]);
                }, 10);
            };
        };

        return {
            twitter: twitter,
            codecontainer: codecontainer
        };
    }
);

