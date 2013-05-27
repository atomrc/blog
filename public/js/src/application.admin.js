/*global require, Blog*/
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
        if (window.confirm('Sure bro ?')) {
            post.$delete({slug: post.slug}, callback);
        }
    };
};

var reset = function (callback) {
    'use strict';
    return function (post) {
        if (window.confirm('It might probably change the url of the post. Are you sure you want to do that ?')) {
            post.$reset({slug: post.slug}, callback);
        }
    };
};

/***************************************/
/*************** SERVICES ***************/
/***************************************/
Blog.services.postManager = [function () {
    return {
        posts: [],
    };
}];

/***************************************/
/*************** ROUTES ***************/
/***************************************/
routes['/'].controller = ['$scope', 'posts', 'Tweet', function ($scope, posts, Tweet) {
    'use strict';
    $scope.posts = posts;
    $scope.deletePost = deletePost(function (post) {
        posts.splice(posts.indexOf(post), 1);
    });
    $scope.publishPost = publishPost;
    Tweet.query(function (tweets) {
        $scope.tweets = tweets;
    });
}];

routes['/posts/:postSlug'].controller = ['$scope', 'post', 'Tag', '$location', function ($scope, post, Tag, $location) {
    'use strict';
    $scope.post = post;
    $scope.newTag = new Tag();

    $scope.publishPost = publishPost;
    $scope.save = savePost();
    $scope.reset = reset(function (post) { $location.url('/posts/' + post.slug); });

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

routes['/post/create'] = {
    templateUrl: '/views/posts_show',

    controller: ['$scope', 'Post', '$location', function ($scope, Post, $location) {
        'use strict';
        $scope.post = new Post();
        $scope.save = savePost(function (post) { $location.url('/posts/' + post.slug); });
    }],

    resolve: {}
};
