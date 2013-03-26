/*global require, window*/
require.config({
    baseUrl: 'js/src/admin',
    config: {
        gplus: {
            parsetags: 'explicit'
        }
    },

    paths: {
        angular: '../../lib/angular.min',
        ngSanitize: '../../lib/angular.sanitize.min',
        ngResource: '../../lib/angular.resource.min',
        rainbow: '../../lib/rainbow.min',
        analytics: 'http://www.google-analytics.com/ga',
        twitter: 'http://platform.twitter.com/widgets',
        disqus: 'http://whysocurious.disqus.com/embed',
        gplus: 'https://apis.google.com/js/plusone'
    },

    shim: {
        angular: {
            init: function () { return window.angular; }
        },

        ngSanitize: {
            exports: 'ngSanitize',
            deps: ['angular']
        },

        ngResource: {
            exports: 'ngResource',
            deps: ['angular']
        },

        rainbow: {
            init: function () { return window.Rainbow; }
        },

        analytics: {
            init: function () { return window._gaq; }
        },

        twitter: {
            init: function () { return twttr; }
        },

        gplus: {
            exports: "gapi"
        },

        disqus: {
            init: function () { return DISQUS; }
        },
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
