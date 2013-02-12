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

            show: ['$scope', 'post', function ($scope, post) {
                $scope.post = post;
                $scope.tag = {};
                $scope.commentAdded = false;

                $scope.saveComment = function (comment) {
                    $scope.commentAdded = true;
                    post.addComment(comment);
                };
            }]
        };

        postsController.index.resolve = {
            posts: ['Post', '$q', function (Post, q) {
                var deferred = q.defer();
                Post.query(function (posts) { deferred.resolve(posts) });
                return deferred.promise;
            }]
        };

        postsController.show.resolve = {
            post: ['Post', '$route', '$q', function (Post, route, q) {
                var deferred = q.defer();
                Post.get({slug: route.current.params.postSlug}, function (post) {
                    deferred.resolve(post);
                });
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

        homeController.index.resolve = {
            posts: ['Post', '$q', function (Post, q) {
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

