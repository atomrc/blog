/*global define*/

define(
    ['../services'],
    function (services) {
        'use strict';
        services.stateManager = function ($http, $window) { return { takeSnapshot: function () {console.log('snap');} }};
        services.stateManager.$inject = ['$http', '$window'];

        return services;
    }
);

