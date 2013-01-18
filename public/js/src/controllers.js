/*global define*/

define([],

    function () {
        'use strict';
        var postsController = null,
            homeController = null;

        postsController = {

            index: function ($http, $scope) {
                $http
                    .get('/posts')
                    .success(function (posts) {
                        $scope.posts = posts;
                    });
            },

            show: function ($http, $scope, $routeParams) {
                $http
                    .get('/posts/' + $routeParams.postSlug)
                    .success(function (post) {
                        $scope.post = post;
                    });
            },

            create: function ($scope, $http) {
                $scope.save = function (post) {
                    $http.post('/posts', post);
                };
            }

        };

        homeController = {
            index: function ($http, $scope, urlBuilder) {
                $http.get('/posts/?limit=3').success(function (posts) {
                    $scope.posts = posts;
                });

                $http.get().success(function (tweets) {
                    $scope.tweets = [];
                });
            }

        };

        return {
            home: homeController,
            posts: postsController
        };
    }
);

