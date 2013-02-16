/*global define, window, console*/

define(['../controllers'],
    function (controllers) {
        'use strict';

        var publishPost = null,
            savePost = null,
            deletePost = null;

        savePost = function (post) {
            if( post._id ) {
                return post.$update(function () { console.log('saved'); });
            }
            post.$save(function (post) { window.location.url('/posts/' + post.slug); });
        };

        publishPost = function (post) {
            post.published = !post.published;
            post.$update();
        };

        deletePost = function (post) {
            if (window.confirm('sure bro ?')) {
                post.$delete();
            }
        };

        controllers.posts.index = ['$scope', 'posts', function ($scope, posts) {
            $scope.posts = posts;
            $scope.publishPost = publishPost;
            $scope.deletePost = deletePost;
        }];

        controllers.posts.show = ['$scope', 'post', 'Comment', 'Tag', function ($scope, post, Comment, Tag) {
            $scope.post = post;
            $scope.newComment = new Comment();
            $scope.newTag = new Tag();
            $scope.commentAdded = false;

            $scope.publishPost = publishPost;
            $scope.save = savePost;

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
            $scope.save = savePost;
        }];

        return controllers;
    }
);

