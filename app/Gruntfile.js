/*global module, grunt*/

module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        srcPath: '../src',
        destPath: 'public',

        requirejs: {
            options: {
                baseUrl: '<%= srcPath %>/js',
                mainConfigFile: '<%= srcPath %>/js/main.js',
                paths: {
                    angular: 'empty:',
                    ngResource: 'empty:',
                    ngAnimate: 'empty:',
                    ngRoute: 'empty:',
                    application: 'main'
                },
                name: 'application',
                out: '<%= destPath %>/js/application.js',
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
                    '<%= destPath %>/partials/application.html': '<%= srcPath %>/views/application.jade'
                }
            },
            admin: {
                options: { data: {auth: true} },
                files: {
                    '<%= destPath %>/partials/application.admin.html': '<%= srcPath %>/views/application.jade'
                }
            }
        },

        sass: {
            dist: {
                files: { '<%= destPath %>/css/application.css': '<%= srcPath %>/sass/application.scss' }
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
                tasks: ['sass'],
                options: {
                    livereload: true
                }
            }
        }
    });

    // Load the npm installed tasks
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');

    // The default tasks to run when you type: grunt
    grunt.registerTask('default', ['requirejs:prod', 'copy', 'jade', 'sass']);
};
