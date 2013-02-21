/*global require, define, angular, window*/

requirejs.config({
    baseUrl: 'js/src',
    paths: {
        angular: '../lib/angular.min',
        ngSanitize: '../lib/angular.sanitize.min',
        ngResource: '../lib/angular.resource.min',
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

        disqus: {
            init: function () { return DISQUS; }
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
