/*global angular, Blog, require, window*/

require.config({
    baseUrl: '/js/src/',
    paths: {
        angular: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0-rc.2/angular.min',
        ngResource: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0-rc.2/angular-resource.min',
        ngAnimate: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0-rc.2/angular-animate.min',
        ngRoute: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0-rc.2/angular-route.min',
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

require(['angular', 'ngResource', 'ngAnimate', 'ngRoute', 'application'], function (angular, ngResource, ngAnimate, ngRoute, application) {
    'use strict';

    var ngApp = angular.module('blog', ['ngResource', 'ngAnimate', 'ngRoute']);

    angular.forEach(application.services, function (service, name) {
        ngApp.factory(name, service);
    });

    //init directives
    angular.forEach(application.directives, function (directive, name) {
        ngApp.directive(name, directive);
    });

    //init filters
    angular.forEach(application.filters, function (filter, name) {
        ngApp.filter(name, filter);
    });

    angular.forEach(application.controllers, function (controller, name) {
        ngApp.controller(name, controller);
    });

    angular.forEach(application.animations, function (animation, name) {
        ngApp.animation(name, animation);
    });

    ngApp.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
        var el;
        $locationProvider.html5Mode(true);
        angular.forEach(application.routes, function (route, name) {
            $routeProvider.when(name, route);
        });
        $routeProvider.otherwise({redirectTo: '/404'});
    }]);

    ngApp.run(['analyticsTracker', 'errorHandler', function () {}]);
});
