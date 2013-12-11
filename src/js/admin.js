/*global define, require*/

define(['angular', 'ngRoute', 'ngResource', 'ngAnimate'], function (angular) {
    'use strict';
    return function (app) {
        /**
         * SERVICES
         */
        app
            .factory('Tag', ['$resource', function ($resource) {
                return $resource('/api/tags/:id', {id: '@id'});
            }])

            .factory('adminPostsManager', ['Post', 'Tag', 'postsManager', function (Post, Tag, postsManager) {
                var posts = postsManager.query();
                return {
                    /**
                     * create - create a new blog post
                     *
                     * @param {Object} data
                     * @return {Promise}
                     */
                    create: function (data) {
                        var post = new Post(data);
                        posts.unshift(post);
                        return post.$save();
                    },

                    /**
                     * remove - delete a post
                     * removes it from the posts array and send a delete request to the server
                     *
                     * @param {Post} post
                     * @return {Promise}
                     */
                    remove: function (post) {
                        posts.removeElement(post);
                        return post.$delete();
                    },

                    /**
                     * update - save a post to the server
                     *
                     * @param {Post} post
                     * @return {Promise}
                     */
                    update: function (post) {
                        return post.$update();
                    },

                    /**
                     * reset - will reset the pubdate and slug of the post
                     *
                     * @param {Post} post
                     * @return {Promise}
                     */
                    reset: function (post) {
                        post.pubdate = null;
                        post.slug = null;
                        return post.$update();
                    },

                    /**
                     * untag - remove a tag from a post
                     *
                     * @param {Post} post
                     * @param {Tag} tag
                     * @return {Promise}
                     */
                    untag: function (post, tag) {
                        post.$untag({ resourceId: tag.id });
                    },

                    /**
                     * tag - add a tag from a post
                     * if the tag has no id then first create it on the server
                     *
                     * @param {Post} post
                     * @param {Tag} tag
                     * @return {Promise}
                     */
                    tag: function (post, tag) {
                        if (tag.id) {
                            //apply the already saved tag to the post
                            return post.$tag({ resourceId: tag.id });
                        }

                        //if the tag doesn't exists in the database 
                        //first make a request to create it
                        tag = new Tag(tag);
                        return tag
                            .$save()
                            .then(function (tag) {
                                //when the tag is created, apply it to the post
                                return post.$tag({ resourceId: tag.id });
                            });
                    }
                };
            }]);


        app
            .directive('wscTabInsensitive', [function () {
                return function ($scope, element) {
                    element.on('keydown', function (event) {
                        if (event.keyCode === 9) {
                            var tab = '    ',
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
                                    html = html.replace(/<code>:(\w+):([^<]+)<\/code>/g, function (str, language) {
                                        var unescapedCode = angular.element(str).html().replace(':' + language + ':', ''),
                                            isSupportedLanguage = false;
                                        for (var i in hl.LANGUAGES) {
                                            if (hl.LANGUAGES.hasOwnProperty(i)) {
                                                isSupportedLanguage = isSupportedLanguage || i === language;
                                            }
                                        }
                                        if (!isSupportedLanguage) { return '!!unsupported language!!'; }
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
                    $scope.create = adminPostsManager.create;

                    $scope.remove = adminPostsManager.remove;

                    $scope.update = adminPostsManager.update;

                    $scope.untag = adminPostsManager.untag;

                    $scope.tag = adminPostsManager.tag;
                };
            }])

            .directive('wscContenteditable', ['$window', function ($window) {
                return {
                    require: 'ngModel',
                    link: function (scope, element, attrs, ctrl) {
                        element.attr('contenteditable', true);
                        var executeAction = function (key, selectedText) {
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
