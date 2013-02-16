/*global define, window*/

define(['angular'],
    function (Angular, models) {
        'use strict';
        var postsController = null,
            homeController = null;

        /****************
         * POSTS CONTROLLER
         * **************/
        postsController = {

            index: ['$scope', 'posts', function ($scope, posts) {
                $scope.posts = posts;
            }],

            show: ['$scope', 'post', 'Comment', function ($scope, post, Comment) {
                $scope.post = post;
                $scope.newComment = new Comment();
                $scope.commentAdded = false;

                $scope.saveComment = function (comment) {
                    $scope.commentAdded = true;
                    post.addComment(comment);
                };
            }]
        };

        postsController.indexResolve = {
            posts: ['Post', '$q', function (Post, q) {
                var deferred = q.defer();
                Post.query(function (posts) { deferred.resolve(posts) });
                return deferred.promise;
            }]
        };

        postsController.showResolve = {
            post: ['Post', '$route', '$q', '$location', function (Post, route, q, $location) {
                var deferred = q.defer();
                Post.get({slug: route.current.params.postSlug}, function (post) {
                    deferred.resolve(post);
                },
                function () { $location.url('/404'); } );
                return deferred.promise;
            }]
        };

        /****************
         * HOME CONTROLLER
         * **************/
        homeController = {
            index: ['$scope', '$http', 'tweetsNormalizer', '$window', 'posts', 'Tweet', function ($scope, http, tweetsNormalizer, $window, posts, Tweet) {
                $scope.posts = posts;
                Tweet.query(function (tweets) {
                    $scope.tweets = tweetsNormalizer.normalize(tweets);
                });
            }]

        };

        homeController.indexResolve = {
            posts: ['Post', '$q', '$location', function (Post, q, $location) {
                var deferred = q.defer();
                Post.query({limit: 3}, function (posts) { deferred.resolve(posts) });
                return deferred.promise;
            }]
        };

        return {
            home: homeController,
            posts: postsController
        };
    }
);

