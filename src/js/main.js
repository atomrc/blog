/*global require, angular, window*/

require.config({
    paths: {
        angular: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.2/angular.min',
        ngResource: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.2/angular-resource.min',
        ngAnimate: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.2/angular-animate.min',
        ngRoute: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.2/angular-route.min'
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
        }
    }
});

require(['angular', 'blog'], function (angular, blog) {
    'use strict';
    var ngBlog = angular.module('blog', ['ngRoute', 'ngResource']);
    blog(ngBlog);
    angular.bootstrap(window.document, ['blog']);
});
