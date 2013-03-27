/*global require, define, angular, window*/

requirejs.config({
    baseUrl: '/js/src',
    paths: {
        angular: '../lib/angular.min',
        ngSanitize: '../lib/angular.sanitize.min',
        ngResource: '../lib/angular.resource.min',
        rainbow: '../lib/rainbow.min',
        analytics: 'http://www.google-analytics.com/ga',
        twitter: 'http://platform.twitter.com/widgets',
        disqus: 'http://whysocurious.disqus.com/embed',
        gplus: 'https://apis.google.com/js/plusone'
    },

    shim: {
        angular: {
            exports: "angular"
        },

        ngSanitize: {
            exports: 'ngSanitize',
            deps: ['angular']
        },

        ngResource: {
            exports: 'ngResource',
            deps: ['angular']
        },

        analytics: {
            exports: "_gaq"
        },

        rainbow: {
            exports: "Rainbow"
        },

        disqus: {
            exports: "DISQUS"
        },

        gplus: {
            exports: "gapi"
        },

        twitter: {
            exports: "twttr"
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
