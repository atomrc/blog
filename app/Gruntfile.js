/*global module*/

module.exports = function (grunt) {
    'use strict';
    var blogConfig = {
        description: "Et si on parlait un peu Javascript, AngularJS et code en général !",
        title: "Why So Curious ?"
    };

    grunt.initConfig({
        srcPath: '../src',
        destPath: 'public',

        requirejs: {
            options: {
                baseUrl: '<%= srcPath %>/js',
                paths: {
                    angular: 'empty:',
                    ngResource: 'empty:',
                    ngAnimate: 'empty:',
                    ngRoute: 'empty:',
                    disqus: 'empty:'
                },
                modules: [
                    { name: 'main' },
                    { name: 'main.admin' }
                ],
                dir: '<%= destPath %>/js',
                optimize: 'uglify2'
            },

            prod: {
            },

            dev: {
                options: { optimize: 'none' }
            }
        },

        jade: {
            front: {
                options: {
                    data: function (dest) {
                        return {
                            auth: /admin/.test(dest),
                            prod: false,
                            conf: blogConfig
                        };
                    }
                },
                files: {
                    '<%= destPath %>/partials/application.html': '<%= srcPath %>/views/application.jade',
                    '<%= destPath %>/partials/application.admin.html': '<%= srcPath %>/views/application.jade'
                }
            }
        },

        sass: {
            dist: {
                files: [
                    { '<%= destPath %>/css/application.css': '<%= srcPath %>/sass/application.scss' },
                    { '<%= destPath %>/css/admin.css': '<%= srcPath %>/sass/admin.scss' }
                ]
            }
        },

        copy: {
            all: {
                files: [
                    { expand: true, cwd: '<%= srcPath %>/static/', src: ['**/*'], dest: '<%= destPath %>/' }
                ]
            }
        },

        watch: {
            scripts: {
                files: '<%= srcPath %>/js/**/*.js',
                tasks: ['requirejs:dev']
            },

            partials: {
                files: '<%= srcPath %>/views/**/*.jade',
                tasks: ['jade']
            },

            css: {
                files: '<%= srcPath %>/sass/*.scss',
                tasks: ['sass']
            }
        },

        exec: {
            deploy: {
                command: 'af update blog-thomasbelin'
            }
        }
    });

    // Load the npm installed tasks
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-exec');

    // The default tasks to run when you type: grunt
    grunt.registerTask('default', ['requirejs:dev', 'copy', 'jade', 'sass']);
    grunt.registerTask('deploy', ['requirejs:prod', 'copy', 'jade', 'sass', 'shell:deploy']);
};
