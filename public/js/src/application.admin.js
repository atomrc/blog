/*global require, Blog*/
(function () {
    'use strict';


    /***************************************/
    /*************** DIRECTIVES ***************/
    /***************************************/
    Blog.directives.autocomplete = ['$http', function ($http) {
        return {
            restrict: 'A',
            template:
                    '<input type="text" data-ng-model="term"><div class="autocomplete-results">' +
                    '<div data-ng-repeat="result in results" data-ng-bind="result.name" data-ng-click="selectResult(result);"></div>' +
                    '</div>',
            scope: { term: '=autocomplete', url: '@autocompleteUrl', select: '&autocompleteSelect' },
            link: function (scope, element, attrs) {
                scope.selectResult = function (result) {
                    scope.select({data: result});
                };
                scope.$watch('term', function (newValue, oldValue) {
                    if (!newValue) { return; }
                    scope.results = [];
                    if (newValue.length > 2) {
                        $http.get(scope.url, { params: { term: newValue }}).then(function (res) {
                            scope.results = res.data;
                        });
                    }
                });
            }
        };
    }];

    /***************************************/
    /*************** SERVICES ***************/
    /***************************************/
    Blog.services.adminPostsManager = ['postsManager', 'Tag', function (postsManager, Tag) {
        postsManager.save = function (post) {
            var self = this;
            if (post._id) {
                return post.$update(function () { console.log('saved'); });
            }
            post.$save(function (post) {
                self.posts.unshift(post);
            });
        };

        postsManager.remove = function (post) {
            var self = this;
            post.$delete(function () {
                self.posts.removeElement(post);
            });
        };

        postsManager.reset = function (post) {
            return post.$reset();
        };

        postsManager.publish = function (post) {
            post.published = !post.published;
            return post.$update();
        };

        postsManager.addTag = function (post, tag) {
            tag.$save({slug: post.slug}, function (newTag) {
                if (newTag) {
                    post.tags.push(newTag);
                }
            });
        };

        postsManager.removeTag = function (post, tag) {
            var dTag = new Tag(tag);
            dTag.$delete({slug: post.slug, tagId: tag._id}, function () {
                post.tags.removeElement(tag);
            });
        };

        return postsManager;
    }];

    /***************************************/
    /*************** CONTROLLERS ***************/
    /***************************************/
    Blog.controllers.postsController = ['$scope', 'adminPostsManager', '$location', '$window', function ($scope, postsManager, $location, $window) {

        $scope.publish = function (post) {
            postsManager.publish(post);
        };

        $scope.save = function (post) {
            postsManager.save(post);
            post.$then(function () {
                $location.url('/posts/' + post.slug);
            });
        };

        $scope.reset = function (post) {
            if ($window.confirm('It might probably change the url of the post. Are you sure you want to do that ?')) {
                postsManager.reset(post);
                post.$then(function () {
                    $location.url('/posts/' + post.slug);
                });
            }
        };

        $scope.remove = function (post) {
            if ($window.confirm('sure bro ?')) {
                postsManager.remove(post);
            }
        };

    }];

    Blog.controllers.tagsController = ['$scope', 'Tag', 'adminPostsManager', function ($scope, Tag, postsManager) {
        $scope.newTag = new Tag();

        $scope.create = function (post, tag) {
            postsManager.addTag(post, tag);
            this.newTag = new Tag();
        };

        $scope.remove = function (post, tag) {
            postsManager.removeTag(post, tag);
        };

        $scope.affectTag = function (post, tag) {
            postsManager.addTag(post, new Tag(tag));
            this.newTag = new Tag();
        };
    }];

    /***************************************/
    /*************** ROUTES ***************/
    /***************************************/

    Blog.routes['/post/create'] = Blog.routes['/posts/:postSlug'];
}());
