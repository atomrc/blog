/*global require, Blog, document*/
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

    Blog.directives.contenteditable = [function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var modifiedElement = null,
                    executeAction = function (key) {
                        switch (key) {
                        case 80: //p
                            document.execCommand('formatBlock', false, 'p');
                            break;
                        case 66: //b
                            document.execCommand('bold');
                            break;
                        case 97: //1
                            document.execCommand('formatBlock', false, 'h1');
                            break;
                        case 98: //2
                            document.execCommand('formatBlock', false, 'h2');
                            break;
                        case 99: //3
                            document.execCommand('formatBlock', false, 'h3');
                            break;
                        case 85: //u
                            document.execCommand('insertUnorderedList');
                            break;
                        case 65: //a
                            document.execCommand('createLink', false, 'http://tofill.com');
                            break;
                        }
                    };
                element.bind('blur', function () {
                    scope.$apply(function () {
                        ctrl.$setViewValue(element.html());
                    });
                });

                // model -> view
                ctrl.$render = function () {
                    element.html(this.$modelValue);
                };

                element.bind('keydown', function (event) {
                    if (event.ctrlKey) {
                        executeAction(event.keyCode);
                        event.preventDefault();
                    }
                });
            }
        };
    }];

    Blog.directives.postEdition = [function () {
        return {
            restrict: 'A',
            scope: { post: '=postEdition' },
            controller: 'postEditionController'
        };
    }];

    /***************************************/
    /*************** SERVICES ***************/
    /***************************************/
    Blog.services.adminPostsManager = ['postsManager', 'Tag', 'Post', function (postsManager, Tag, Post) {

        postsManager.create = function (post) {
            post.$save();
            this.posts.unshift(post);
        };

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

        postsManager.toggleState = function (post) {
            post.status = (post.status + 1) % 3;
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
    Blog.controllers.postEditionController = ['$scope', 'adminPostsManager', 'Post', '$location', '$window', function ($scope, postsManager, Post, $location, $window) {

        $scope.add = function () { $scope.newPost = new Post(); };

        $scope.create = function (post) {
            postsManager.create(post);
            $scope.newPost = null;
        };

        $scope.toggleState = postsManager.toggleState;

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

}());
