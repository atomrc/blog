/*global require, angular, window*/

require.config({
    paths: {
        angular: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular.min',
        ngResource: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular-resource.min',
        ngAnimate: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular-animate.min',
        ngRoute: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular-route.min'
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

require(['angular', 'ngAnimate', 'ngRoute', 'ngResource'], function (angular) {
    'use strict';
    var ngBlog = angular.module('blog', []);
    angular.bootstrap(window.document, ['blog']);
});
