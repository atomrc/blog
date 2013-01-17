/*global require, define*/

require.config({
    baseUrl: 'js/src',
    paths: {
        angular: '../lib/angular.min'
    },
    shim: {
        'angular': {
            exports: "Angular"  //attaches "Backbone" to the window object
        }
    }
});

require(['angular', 'application'], function (Angular, application) {
    'use strict';
    application.initialize();
});
