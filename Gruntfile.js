/*global module, grunt*/

module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({

        requirejs: {
            options: {
                baseUrl: './frontend/js',
                mainConfigFile: './frontend/js/application.js',
                paths: {
                    angular: 'empty:',
                    ngResource: 'empty:',
                    ngAnimate: 'empty:',
                    ngRoute: 'empty:'
                },
                name: 'application',
                out: 'backend/public/js/application.js',
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
                    'backend/public/partials/application.html': 'backend/views/application.jade'
                }
            },
            admin: {
                options: { data: {auth: true} },
                files: {
                    'backend/public/partials/application.admin.html': 'backend/views/application.jade'
                }
            }
        },

        copy: {
            all: {
                files: [
                    { expand: true, cwd: 'frontend/css', src: ['**/*.css'], dest: 'backend/public/css' },
                    { expand: true, cwd: 'frontend/static/', src: ['**/*'], dest: 'backend/public/' }
                ]
            }
        },

        watch: {
            scripts: {
                files: 'frontend/**/*.js',
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
