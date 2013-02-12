/*global define, window*/

define(['../controllers'],
    function (controllers) {
        'use strict';

        controllers.posts.index = ['$scope', 'posts', 'Post', function ($scope, posts, Post) {
            $scope.posts = posts;

            $scope.publishPost = function (post) {
                post.published = !post.published;
                var newPost = new Post(post);
                newPost.$update();
            };

            $scope.deletePost = function (post) {
                if (window.confirm('sure bro ?')) {
                    var dPost = new Post(post);
                    dPost.$delete(function () {
                        posts.splice(posts.indexOf(post), 1);
                    });
                }
            };
        }];

        controllers.posts.create = ['$scope', 'Post', '$location', function ($scope, Post, $location) {
            $scope.save = function (post) {
                var post = new Post(post);
                post.$save();
            };
        }];

        controllers.posts.edit = ['$scope', '$routeParams', 'post', function ($scope, $routeParams, post) {
            $scope.post = post;
            $scope.save = function () {
                post.$update();
            };
        }];
        controllers.posts.editResolve = controllers.posts.showResolve;

        return controllers;
    }
);

