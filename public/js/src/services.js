/*global define*/

define([],
    function () {
        'use strict';
        var app = { 'apikey': 'felix' },
            urlBuilder = null;

        urlBuilder = function (application) {
            this.application = application;
            this.build = function (url, queryParams) {
                var queryStr = '';
                if (queryParams === undefined) {
                    queryParams = [];
                }
                if (this.application.apikey !== null) {
                    queryParams.push('apikey=' + this.application.apikey);
                }
                if (queryParams.length > 0) {
                    queryStr = '?' + queryParams.join('&');
                }
                return url + queryStr;
            };

            return this;
        };

        return {
            application: app,
            urlBuilder: urlBuilder
        };
    }
);

