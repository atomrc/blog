/*global require, define, angular, window*/

requirejs.config({
    baseUrl: 'js/src',
    paths: {
        angular: '../lib/angular.min',
        ngSanitize: '../lib/angular.sanitize.min',
        analytics: 'http://www.google-analytics.com/ga',
        twitter: 'http://platform.twitter.com/widgets'
    },

    shim: {
        angular: {
            init: function () { return angular; }
        },

        ngSanitize: {
            exports: 'ngSanitize',
            deps: ['angular']
        },

        analytics: {
            init: function () { return window._gaq; }
        },

        twitter: {
            init: function () { return twttr; }
        }
    }
});

require(
    ['application'],
    function (application) {
        'use strict';
        application.init();
        application.run();
    }
);
