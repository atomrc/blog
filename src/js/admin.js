/*global define, ga*/

define(['ngRoute', 'ngResource', 'ngAnimate'], function () {
    'use strict';
    return function (app) {
        /**
         * SERVICES
         */
        app.factory('adminPostsManager', ['Post', 'postsManager', function (Post, postsManager) {
            var posts = postsManager.query();
            return {
                create: function (data) {
                    var post = new Post(data);
                    posts.unshift(post);
                    post.$save();
                },

                remove: function (post) {
                    posts.removeElement(post);
                    post.$delete();
                },

                update: function (post) {
                    post.$update();
                }
            };
        }]);


        app
            .directive('wscTabInsensitive', [function () {
                return function ($scope, element) {
                    element.on('keydown', function (event) {
                        if (event.keyCode === 9) {
                            var tab = '\t',
                                startPos = this.selectionStart,
                                endPos = this.selectionEnd,
                                scrollTop = this.scrollTop;
                            this.value = this.value.substring(0, startPos) + tab + this.value.substring(endPos,this.value.length);
                            this.selectionStart = startPos + tab.length;
                            this.selectionEnd = startPos + tab.length;
                            this.scrollTop = scrollTop;
                            event.preventDefault();
                        }
                    });
                };
            }])

            .directive('wscBodyCompiler', [function () {
                return {
                    require: '?ngModel',
                    link: function ($scope, element, attrs, ngModel) {
                        ngModel.$render = function () {
                            element.html(ngModel.$modelValue);
                        };

                        require(['highlight', 'markdown'], function (hl, md) {
                            $scope.$watch(attrs.wscBodyCompiler, function (toCompile) {
                                if (toCompile) {
                                    var html = md.toHTML(toCompile);
                                    html = html.replace(/<code>:(\w+):([^<]+)<\/code>/g, function (str, language, code) {
                                        var unescapedCode = angular.element(str).html().replace(':' + language + ':', '');
                                        return '<code>' + hl.highlight(language, unescapedCode).value + '</code>';
                                    });
                                    ngModel.$setViewValue(html);
                                    ngModel.$render();
                                }
                            });
                        });
                    }
                };
            }])

            .directive('wscEdit', ['adminPostsManager', function (adminPostsManager) {
                return function ($scope) {
                    var markdown = null,
                        highlight = null;

                    $scope.create = function (post) {
                        adminPostsManager.create(post);
                    };

                    $scope.remove = function (post) {
                        adminPostsManager.remove(post);
                    };

                    $scope.update = function (post) {
                        adminPostsManager.update(post);
                    };
                };
            }])

            .directive('wscContenteditable', ['$window', function ($window) {
                return {
                    require: 'ngModel',
                    link: function (scope, element, attrs, ctrl) {
                        element.attr('contenteditable', true);
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
            }]);
    };
});
