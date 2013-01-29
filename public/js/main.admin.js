/*global require, window*/
require.config({
    baseUrl: 'js/src/admin',
    paths: {
        angular: '../../lib/angular.min',
        ngSanitize: '../../lib/angular.sanitize.min',
        analytics: 'http://www.google-analytics.com/ga'
    },

    shim: {
        angular: {
            init: function () { return window.angular; }
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
