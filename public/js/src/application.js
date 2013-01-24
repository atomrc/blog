/*global require, define, angular, window*/

define(
    ['angular', 'routes', 'services', 'directives', 'ngSanitize'],
    function (Angular, routes, services, directives, ngSanitize) {
        'use strict';
        var application = {
            module: null,

            init: function () {
                this.initModule();
                this.initDirectives();
                this.initRoutes();
            },

            initModule: function () {
                this.module = Angular.module('blog', ['ngSanitize'], function ($provide) {
                    for (var service in services) {
                        $provide.factory(service, services[service]);
                    }
                });
            },

            initDirectives: function () {
                for(var directive in directives) {
                    this.module.directive(directive, directives[directive]);
                }
            },

            initRoutes: function () {
                this.module.config(['$locationProvider', function ($locationProvider) {
                    $locationProvider.hashPrefix('!');
                }]);
                this.module.config(['$routeProvider', function ($routeProvider) {
                    for (var route in routes) {
                        $routeProvider.when(route, routes[route]);
                    }
                    $routeProvider.otherwise({redirectTo: '/'});
                }]);
            },

            run: function () {
                Angular.bootstrap(window.document, ['blog']);
            }
        };

        return application;
    }
);
