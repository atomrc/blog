/*global define, window*/

define(['../controllers'],
    function (controllers) {
        'use strict';

        controllers.posts.create = function ($scope, $http, $location) {
            $scope.save = function (post) {
                $http.post('/posts', post).success(function (post) {
                    $location.url('/posts');
                });
            };
        };

        controllers.posts.edit = function ($scope, $http, $routeParams) {
            var postUrl = '/posts/' + $routeParams.postSlug;
            $http
                .get(postUrl)
                .success(function (post) {
                    $scope.post = post;
                });

            $scope.save = function (post) {
                delete post._id;
                $http
                    .put(postUrl, post)
                    .success(function (post) {
                        $location.url('/posts');
                    });
            };
        };

        return controllers;
    }
);

