define([], function () {
    'use strict';
    return {
        load: function (config) {
            require.config({
                baseUrl: config.baseUrl,
                paths: {
                    angular: config.libPath + '/angular.min',
                    ngSanitize: config.libPath + '/angular.sanitize.min'
                },

                shim: {
                    angular: {
                        exports: 'Angular',
                        init: function () { return angular; }
                    },

                    ngSanitize: {
                        exports: 'ngSanitize',
                        deps: ['angular']
                    }
                }
            });
        }
    };
});
