/*global define, document */
/*jslint nomen: true */
define(['angular', 'extensions', 'application'], function (angular, extensions, application) {
    'use strict';

    /***************************************/
    /*************** DIRECTIVES ***************/
    /***************************************/
    application.directives.autocomplete = ['$http', function ($http) {
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

    application.directives.contenteditable = ['$window', function ($window) {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var modifiedElement = null,
                    executeAction = function (key, selectedText) {
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
                            if (selectedText && selectedText.match(/http:\/\/[A-Za-z0-9.\/-_]+/)) {
                                document.execCommand('createLink', false, selectedText);
                            }
                            break;
                        }
                    };

                element.bind('blur', function () {
                    scope.$apply(function () {
                        scope.$emit('updateModel');
                    });
                });

                scope.$on('updateModel', function () {
                    ctrl.$setViewValue(element.html());
                });

                // model -> view
                ctrl.$render = function () {
                    element.html(this.$modelValue);
                };

                element.bind('keyup', function (event) {
                    if (!event.ctrlKey) {
                        scope.$emit('updateModel');
                    }
                });
                element.bind('keydown', function (event) {
                    if (event.ctrlKey) {
                        executeAction(event.keyCode, $window.getSelection().toString());
                        event.preventDefault();
                    }
                });
            }
        };
    }];

    application.directives.postEdition = ['$document', function ($document) {
        return {
            restrict: 'A',
            scope: { post: '=postEdition' },
            controller: 'postEditionController'
        };
    }];

    /***************************************/
    /*************** SERVICES ***************/
    /***************************************/
    application.services.adminPostsManager = ['postsManager', 'Tag', 'Post', function (postsManager, Tag, Post) {

        postsManager.create = function (post) {
            return post
                .$save()
                .then(function () {
                    this.posts.unshift(post);
                }.bind(this));
        };

        postsManager.save = function (post) {
            var self = this;
            if (post.id) {
                return post.$update();
            }
            return post.$save().then(function (post) {
                self.posts.unshift(post);
            });
        };

        postsManager.remove = function (post) {
            var self = this;
            post
                .$delete()
                .then(function () {
                    self.posts.removeElement(post);
                });
        };

        postsManager.reset = function (post) {
            post.pubdate = null;
            post.slug = null;
            return post.$update();
        };

        postsManager.toggleState = function (post) {
            post.status = (post.status + 1) % 3;
            return post.$update();
        };

        postsManager.tag = function (post, tag) {
            var affect = function (post, tag) {
                post.$tag({ resourceId: tag.id });
            };

            if (!tag.id) {
                tag = new Tag(tag);
                return tag.$save().then(function (tag) {
                    affect(post, tag);
                });
            }
            affect(post, tag);
        };

        postsManager.untag = function (post, tag) {
            post.$untag({ resourceId: tag.id });
        };

        return postsManager;
    }];

    /***************************************/
    /*************** CONTROLLERS ***************/
    /***************************************/
    application.controllers.postEditionController = ['$scope', 'adminPostsManager', 'Post', '$location', '$window', function ($scope, postsManager, Post, $location, $window) {

        $scope.add = function () { $scope.newPost = new Post(); };

        $scope.$watch('post', function (newValue, oldValue) {
            if (!newValue || !oldValue) { return; }
            newValue.$unsaved = true;
        }, true);

        $scope.keydown = function (event) {
            if (event.ctrlKey && event.keyCode === 83) {
                $scope.$emit('updateModel');
                $scope.save();
            }
        };

        $scope.create = function (post) {
            postsManager.create(post);
            $scope.newPost = null;
        };

        $scope.toggleState = postsManager.toggleState;

        $scope.save = function () {
            var post = $scope.post;
            postsManager
                .save(post)
                .then(function () {
                    $location.url('/posts/' + post.slug);
                });
        };

        $scope.reset = function (post) {
            if ($window.confirm('It might probably change the url of the post. Are you sure you want to do that ?')) {
                postsManager
                    .reset(post)
                    .then(function () {
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

    application.controllers.tagsController = ['$scope', 'Tag', 'adminPostsManager', function ($scope, Tag, postsManager) {
        $scope.create = function () {
            $scope.newTag = new Tag();
        };

        $scope.tag = function (post, tag) {
            postsManager.tag(post, tag);
            $scope.newTag = null;
        };

        $scope.remove = function (post, tag) {
            postsManager.untag(post, tag);
        };

    }];

    return application;

});
