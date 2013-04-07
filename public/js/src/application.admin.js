/*global require, controllers, routes, window*/
var savePost = function (callback) {
    return function (post) {
        if( post._id ) {
            return post.$update(function () { console.log('saved'); });
        }
        post.$save(callback);
    };
};

var publishPost = function (post) {
    post.published = !post.published;
    post.$update();
};

var deletePost = function (callback) {
    return function (post) {
        if (window.confirm('sure bro ?')) {
            post.$delete(callback);
        }
    };
};

/***************************************/
/*************** ROUTES ***************/
/***************************************/
routes['/posts/:postSlug'].controller = ['$scope', 'post', 'Tag', function ($scope, post, Tag) {
    'use strict';
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

routes['/posts/create'] = {
    templateUrl: '/views/posts_show',

    controller: ['$scope', 'Post', '$location', function ($scope, Post, $location) {
        $scope.post = new Post();
        $scope.save = savePost(function (post) { $location.url('/posts/' + post.slug); });
    }],

    resolve: {}
};
