/*global define*/

define([],

    function () {
        'use strict';
        var postsController = {
            index: function ($http, $scope) {
                $http.get('/posts').success(function (posts) {
                    $scope.posts = posts;
                });
            }
        };

        var homeController = {
            index: function($http, $scope) {
                $http.get('/posts?limit=3').success(function (posts) {
                    $scope.posts = posts;
                });

                $http.get().success(function (tweets) {
                    $scope.tweets = tweets;
                });
            }
        };

        return {
            home: homeController,
            posts: postsController
        };
    }
);

