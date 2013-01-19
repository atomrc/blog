/*global define*/

define([],
    function () {
        'use strict';
        var postsController = null,
            homeController = null;

        /****************
         * POSTS CONTROLLER
         * **************/
        postsController = {

            index: function ($http, $scope) {
                $http
                    .get('/posts')
                    .success(function (posts) {
                        $scope.posts = posts;
                    });
            },

            show: function ($http, $scope, $routeParams) {
                var postUrl = '/posts/' + $routeParams.postSlug;
                $scope.commentAdded = false;
                $http
                    .get(postUrl)
                    .success(function (post) {
                        $scope.post = post;
                    });

                $scope.saveComment = function (comment) {
                    $http
                        .post(postUrl + '/comments', comment)
                        .success(function (post) {
                            $scope.post = post;
                            $scope.commentAdded = true;
                        });
                };

                $scope.deleteComment = function (comment) {
                    $http
                        .delete(postUrl + '/comments/' + comment._id)
                        .success(function (post) {
                            $scope.post = post;
                        });
                };

            },

            create: function ($scope, $http, $location) {
                $scope.save = function (post) {
                    $http.post('/posts', post).success(function (post) {
                        $location.url('/posts');
                    });
                };
            }

        };


        /****************
         * HOME CONTROLLER
         * **************/
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

