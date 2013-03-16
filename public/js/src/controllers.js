/*global define, window*/

define(['angular'],
    function (Angular) {
        'use strict';
        var postsController = null,
            homeController = null;

        /****************
         * POSTS CONTROLLER
         * **************/
        postsController = {

            index: ['$scope', 'posts', function ($scope, posts) {
                $scope.title = 'Articles - Why So Curious ?';
                $scope.posts = posts;
            }],

            show: ['$scope', '$location', 'post', 'disqus', function ($scope, $location, post, disqus) {
                $scope.title = post.title;
                $scope.post = post;
                $scope.location = $location.absUrl();
                $scope.escapedLocation = $location.absUrl().replace('#!', '?_escaped_fragment_=');
                disqus.init(post);
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
            index: ['$scope', '$http', '$window', 'posts', 'Tweet', function ($scope, http, $window, posts, Tweet) {
                $scope.posts = posts;
                Tweet.query(function (tweets) {
                    $scope.tweets = tweets;
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

