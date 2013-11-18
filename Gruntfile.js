/*global module, grunt*/

module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({

        requirejs: {
            options: {
                baseUrl: './front/js',
                dir: './public/js',
                mainConfigFile: './front/js/application.js',
                paths: {
                    angular: 'empty:',
                    ngResource: 'empty:',
                    ngAnimate: 'empty:',
                    ngRoute: 'empty:'
                },
                optimize: 'none'
            },

            prod: {
                options: {
                    optimize: 'uglify2'
                }
            },

            dev: {
                options: { optimize: 'none' }
            }
        },

        jade: {
            exposed: {
                options: { data: {
                    auth: false,
                    description: "Et si on parlait un peu Javascript, AngularJS et code en général !",
                    title: "Why So Curious ?"
                } },
                files: {
                    'public/partials/application.html': 'views/application.jade'
                }
            },
            admin: {
                options: { data: {auth: true} },
                files: {
                    'public/partials/application.admin.html': 'views/application.jade'
                }
            }
        },

        copy: {
            all: {
                files: [
                    { expand: true, cwd: 'front/css', src: ['**/*.css'], dest: 'public/css' },
                    { expand: true, cwd: 'front/images', src: ['**/*'], dest: 'public/images' }
                ]
            }
        },

        watch: {
            scripts: {
                files: 'front/**/*.js',
                tasks: ['requirejs:dev']
            },

            partials: {
                files: 'views/**/*.jade',
                tasks: ['jade']
            }
        }
    });

    // Load the npm installed tasks
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // The default tasks to run when you type: grunt
    grunt.registerTask('default', ['requirejs:prod', 'copy', 'jade']);
};
