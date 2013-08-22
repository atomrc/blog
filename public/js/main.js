/*global angular, Blog, require, window*/

require.config({
    baseUrl: '/',
    paths: {
        requirejslib: './js/lib/require.min',
        angular: './js/lib/angular/1.2/angular.min',
        ngResource: './js/lib/angular/1.2/angular.resource.min',
        ngSanitize: './js/lib/angular/1.2/angular.sanitize.min',
        ngAnimate: './js/lib/angular/1.2/angular.animate.min',
        ngRoute: './js/lib/angular/1.2/angular.route.min',
        rainbow: './js/lib/rainbow.min',
        analytics: 'http://www.google-analytics.com/ga',
        disqus: 'http://whysocurious.disqus.com/embed'
    },

    shim: {
        angular: {
            exports: "angular"
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

if (!window.angular) {
    require(['angular', 'requirejslib', 'ngSanitize', 'ngResource', 'ngAnimate', 'ngRoute']);
}

(function () {
    'use strict';
    var element,
        application = angular.module('blog', ['ngResource', 'ngAnimate', 'ngRoute']);

    for (element in Blog.services) {
        if (Blog.services.hasOwnProperty(element)) {
            application.factory(element, Blog.services[element]);
        }
    }
    //init directives
    for (element in Blog.directives) {
        if (Blog.directives.hasOwnProperty(element)) {
            application.directive(element, Blog.directives[element]);
        }
    }
    //init filters
    for (element in Blog.filters) {
        if (Blog.filters.hasOwnProperty(element)) {
            application.filter(element, Blog.filters[element]);
        }
    }

    for (element in Blog.controllers) {
        if (Blog.controllers.hasOwnProperty(element)) {
            application.controller(element, Blog.controllers[element]);
        }
    }

    for (element in Blog.animations) {
        if (Blog.animations.hasOwnProperty(element)) {
            application.animation(element, Blog.animations[element]);
        }
    }

    application.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
        var el;
        $locationProvider.html5Mode(true);
        for (el in Blog.routes) {
            if (Blog.routes.hasOwnProperty(el)) {
                $routeProvider.when(el, Blog.routes[el]);
            }
        }
        $routeProvider.otherwise({redirectTo: '/404'});
    }]);

    application.run(['analyticsTracker', 'errorHandler', function () {}]);

}());
