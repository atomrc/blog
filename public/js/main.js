/*global require, define, angular, window*/

requirejs.config({
    baseUrl: 'js/src',
    paths: {
        angular: '../lib/angular.min',
        ngSanitize: '../lib/angular.sanitize.min',
        analytics: 'http://www.google-analytics.com/ga'
    },

    shim: {
        angular: {
            exports: 'Angular',
            init: function () { return angular; }
        },

        ngSanitize: {
            exports: 'ngSanitize',
            deps: ['angular']
        },

        analytics: {
            init: function () { return window._gaq; }
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
