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

        controllers.posts.show = ['$scope', 'post', 'Comment', function ($scope, post, Comment) {
            $scope.post = post;
            $scope.commentAdded = false;

            $scope.saveComment = function (comment) {
                $scope.commentAdded = true;
                post.addComment(comment);
            };

            $scope.deleteComment = function (comment) {
                if (window.confirm('Sure bro ?') ) {
                    var dComment = new Comment(comment);
                    dComment.$delete({slug: post.slug, commentId: comment._id}, function () {
                        post.comments.splice(post.comments.indexOf(comment), 1);
                    });
                }
            };
        }];


        controllers.posts.create = ['$scope', 'Post', '$location', function ($scope, Post, $location) {
            $scope.post = new Post();
            $scope.save = function () {
                $scope.post.$save();
            };
        }];

        controllers.posts.edit = ['$scope', '$routeParams', 'post', function ($scope, $routeParams, post) {
            $scope.post = post;
            $scope.save = function () {
                post.$update(function () {
                    console.log('saved');
                });
            };
        }];
        controllers.posts.editResolve = controllers.posts.showResolve;

        return controllers;
    }
);

