/*global require, define, angular, window*/

define(
    ['angular', 'routes', 'services', 'directives', 'filters', 'ngSanitize', 'ngResource'],
    function (Angular, routes, services, directives, filters, ngSanitize) {
        'use strict';
        var application = {
            module: null,

            init: function () {
                this.initModules();
                this.initDirectives();
                this.initFilters();
                this.initRoutes();
            },

            initModules: function () {
                this.module = Angular.module('blog', ['ngResource', 'ngSanitize'], ['$provide', function ($provide) {
                    for (var service in services) {
                        $provide.factory(service, services[service]);
                    }
                }]).run(['analyticsTracker', 'stateManager', function () {}]);
            },

            initDirectives: function () {
                for(var directive in directives) {
                    this.module.directive(directive, directives[directive]);
                }
            },

            initFilters: function () {
                for(var filter in filters) {
                    this.module.filter(filter, filters[filter]);
                }
            },

            initRoutes: function () {
                this.module.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
                    $locationProvider.html5Mode(true);
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
