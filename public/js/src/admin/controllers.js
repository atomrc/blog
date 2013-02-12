/*global define, window*/

define(['../controllers'],
    function (controllers) {
        'use strict';

        controllers.posts.index = ['$scope', 'posts', function ($scope, posts) {
            $scope.posts = posts;

            $scope.publishPost = function (post) {
                post.published = !post.published;
                $http.put('/posts/' + post.slug, { published: post.published }).success(function (post) {
                    $scope.post = post;
                });
            };

            $scope.deletePost = function (post) {
                if (window.confirm('sure bro ?')) {
                    $http
                        .delete('/posts/' + post.slug)
                        .success(function (delPost) {
                            var posts = $scope.posts;
                            $scope.posts = [];
                            Angular.forEach(posts, function (postElement) {
                                if (postElement._id !== delPost._id) {
                                    $scope.posts.push(postElement);
                                }
                            });
                        });
                }
            };
        }];

        controllers.posts.create = function ($scope, $http, $location) {
            $scope.save = function (post) {
                $http.post('/posts', post).success(function (post) {
                    $location.url('/posts');
                });
            };
        };
        controllers.posts.create.$inject = ['$scope', '$http', '$location'];

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
                        console.log('saved');
                    });
            };
        };
        controllers.posts.edit.$inject = ['$scope', '$http', '$routeParams'];

        return controllers;
    }
);

