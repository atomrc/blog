/*global require, define, angular, window*/

requirejs.config({
    baseUrl: 'js/src',
    paths: {
        angular: '../lib/angular.min',
        ngSanitize: '../lib/angular.sanitize.min'
    },

    shim: {
        angular: {
            exports: 'Angular',
            init: function () { return angular; }
        },

        ngSanitize: {
            exports: 'ngSanitize',
            deps: ['angular']
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
