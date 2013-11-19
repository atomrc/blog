/*global require, define, document*/

define(['angular', 'ngResource', 'ngAnimate', 'ngRoute'], function (angular, ngResource, ngAnimate, ngRoute) {
    'use strict';

    return function (application) {

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

        ngApp.run(['pageTracker', 'errorHandler', function () {}]);

        angular.bootstrap(document, ['blog']);

        return ngApp;
    };

});
