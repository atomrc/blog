/*global require, define, angular, window*/

requirejs.config({
    baseUrl: 'js/src',
    paths: {
        angular: '../lib/angular.min',
        ngSanitize: '../lib/angular.sanitize.min',
        ngResource: '../lib/angular.resource.min',
        rainbow: '../lib/rainbow.min',
        analytics: 'http://www.google-analytics.com/ga',
        twitter: 'http://platform.twitter.com/widgets',
        disqus: 'http://whysocurious.disqus.com/embed'
    },

    shim: {
        angular: {
            init: function () { return angular; }
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
            init: function () { return window._gaq; }
        },

        rainbow: {
            init: function () { return window.Rainbow; }
        },

        disqus: {
            init: function () { return window.DISQUS; }
        },

        twitter: {
            init: function () { return window.twttr; }
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
