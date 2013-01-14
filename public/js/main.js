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
            deps : ['underscore'],
            exports: 'Backbone'
        }
    }
});

require(['jquery', 'underscore', 'application'], function ($, underscore, application) {
    'use strict';
    application.initialize();
});
