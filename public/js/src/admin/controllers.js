/*global define, window, console*/

define(['../controllers'],
    function (controllers) {
        'use strict';

        var publishPost = null,
            savePost = null,
            deletePost = null;

        savePost = function (callback) {
            return function (post) {
                if( post._id ) {
                    return post.$update(function () { console.log('saved'); });
                }
                post.$save(callback);
            };
        };

        publishPost = function (post) {
            post.published = !post.published;
            post.$update();
        };

        deletePost = function (callback) {
            return function (post) {
                if (window.confirm('sure bro ?')) {
                    post.$delete(callback);
                }
            };
        };

        controllers.posts.index = ['$scope', 'posts', function ($scope, posts) {
            $scope.posts = posts;
            $scope.publishPost = publishPost;
            $scope.deletePost = deletePost(function (post) {
                posts.splice(posts.indexOf(post), 1);
            });
        }];

        controllers.posts.show = ['$scope', 'post', 'Tag', function ($scope, post, Tag) {
            $scope.post = post;
            $scope.newTag = new Tag();

            $scope.publishPost = publishPost;
            $scope.save = savePost();

            $scope.addTag = function (tag) {
                post.addTag(tag);
                $scope.newTag = new Tag();
            };

            $scope.deleteTag = function (tag) {
                var dTag = new Tag(tag);
                dTag.$delete({slug: post.slug, tagId: tag._id}, function () {
                    post.tags.splice(post.tags.indexOf(tag), 1);
                });
            };

        }];


        controllers.posts.create = ['$scope', 'Post', '$location', function ($scope, Post, $location) {
            $scope.post = new Post();
            $scope.save = savePost(function (post) { $location.url('/posts/' + post.slug); });
        }];

        return controllers;
    }
);

