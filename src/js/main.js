/*global require */

require(['angular', 'bootstrap.public', 'extensions', 'ngRoute', 'ngResource', 'ngAnimate'], function (angular, bootstrap) {
    'use strict';
    var ngBlog = angular.module('blog', ['ngRoute', 'ngResource', 'ngAnimate']);
    bootstrap(ngBlog);
    angular.bootstrap(window.document, ['blog']);
});
