/*global require, angular, window*/

require.config({
    paths: {
        angular: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.3/angular.min',
        ngResource: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.3/angular-resource.min',
        ngAnimate: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.3/angular-animate.min',
        ngRoute: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.3/angular-route.min',
        disqus: 'http://whysocurious.disqus.com/embed',
        rainbow: '/js/libs/rainbow.min'
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

        rainbow: {
            exports: 'Rainbow'
        }
    }
});

require(['angular', 'blog'], function (angular, blog) {
    'use strict';
    var ngBlog = angular.module('blog', ['ngRoute', 'ngResource', 'ngAnimate']);
    blog(ngBlog);
    angular.bootstrap(window.document, ['blog']);
});
