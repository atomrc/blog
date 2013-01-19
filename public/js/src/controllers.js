/*global define*/

define(['angular'],
    function (Angular) {
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
            },

            edit: function ($scope, $http, $routeParams) {
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
                            $location.url('/posts');
                        });
                };
            }

        };


        /****************
         * HOME CONTROLLER
         * **************/
        homeController = {
            index: function ($http, $scope, tweetsNormalizer) {
                $http.get('/posts/?limit=3').success(function (posts) {
                    $scope.posts = posts;
                });

                $http.jsonp('http://api.twitter.com/1/statuses/user_timeline.json?count=10&include_rts=true&screen_name=thomasbelin4&callback=JSON_CALLBACK').success(function (tweets) {
                    $scope.tweets = tweetsNormalizer.normalize(tweets);
                });
            }

        };

        return {
            home: homeController,
            posts: postsController
        };
    }
);

