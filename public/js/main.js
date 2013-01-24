/*global require, define, angular, window*/
require(
    ['config/public', 'config/loader'],
    function (config, loader) {
        'use strict';
        loader.load(config);

        require(
            ['application'],
            function (application) {
                application.init();
                application.run();
            }
        );
    }
);
