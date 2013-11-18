/*global require, document*/

require.config({
    baseUrl: '/js/src/',
    paths: {
        angular: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular.min',
        ngResource: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular-resource.min',
        ngAnimate: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular-animate.min',
        ngRoute: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular-route.min',
        rainbow: '../lib/rainbow.min',
        analytics: 'http://www.google-analytics.com/ga',
        disqus: 'http://whysocurious.disqus.com/embed'
    },

    shim: {
        angular: {
            exports: "angular"
        },

        ngAnimate: {
            deps: ['angular']
        },

        ngRoute: {
            deps: ['angular']
        },

        ngResource: {
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
        }
    }
});

require(['bootstrap', 'application.admin'], function (bootstrap, application) {
    'use strict';
    bootstrap(application);
});
