/*global require*/
require(
    ['config/admin', 'config/loader'],
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
