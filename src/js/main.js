/*global require, angular, window*/

require.config({
    baseUrl: '/js',
    paths: {
        angular: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.3/angular.min',
        ngResource: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.3/angular-resource.min',
        ngAnimate: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.3/angular-animate.min',
        ngRoute: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.3/angular-route.min',
        disqus: 'http://whysocurious.disqus.com/embed',
        highlight: 'libs/highlight.pack',
        markdown: 'libs/markdown'
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

        disqus: {
            exports: 'DISQUS'
        },

        highlight: { exports: 'hljs' },

        markdown: { exports: 'Markdown' }
    }
});

require(['angular', 'public', 'extensions', 'ngRoute', 'ngResource', 'ngAnimate'], function (angular, bootstrap) {
    'use strict';
    var ngBlog = angular.module('blog', ['ngRoute', 'ngResource', 'ngAnimate']);
    bootstrap(ngBlog);
    //TODO switch between admin and public config
    if (loadAdmin) {
        require(['admin'], function (adminBoostrap) {
            adminBoostrap(ngBlog);
            angular.bootstrap(window.document, ['blog']);
        });
    } else {
        angular.bootstrap(window.document, ['blog']);
    }
});
