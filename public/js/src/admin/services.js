/*global define*/

define(
    ['../services'],
    function (services) {
        'use strict';
        services.snapshotManager = function ($http, $window) { return { takeSnapshot: function () {console.log('snap');} }};
        services.snapshotManager.$inject = ['$http', '$window'];

        return services;
    }
);

