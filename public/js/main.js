/*global require*/
require.config({
    baseUrl: 'js/src',
    paths: {
        jquery: '../lib/jquery',
        backbone: '../lib/backbone',
        underscore: '../lib/underscore',
        mustache: '../lib/mustache'
    },
    shim: {
        backbone: {
            deps : ['jquery', 'underscore'],
            exports: 'Backbone'
        }
    }
});

require(['application'], function (application) {
    'use strict';
    application.initialize();
});
