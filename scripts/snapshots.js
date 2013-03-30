/*global require, console, phantom*/
var page = require('webpage').create(),
    apikey = require('../config/parameters.js').apikey,
    root = 'http://thomasbelin.fr',
    sitemap = root + '/sitemap.json',
    saveUrl = root + '/api/snapshots?apikey=' + apikey,
    urls = [],
    snapshot;

snapshot = function (urls) {
    'use strict';
    if (urls.length === 0) { phantom.exit(); }

    var url = root + urls.pop();
    console.log('TODO', url);
    var currentPage = require('webpage').create();
    currentPage.open(url, function (status) {
        if (status !== 'success') {
            console.log('FAIL', url);
        }
        var takeSnap = function () {
            var data = currentPage.evaluate(function () {
                 var content, loc, title;
                 content = document.getElementById('main-content').innerHTML;
                 loc = window.location.pathname;
                 title = document.title;
                 return { html: content, page: loc, title: title };
            });
            console.log('SAVE', url, data.title);
            var u = encodeURIComponent(data.page);
            var html = encodeURIComponent(data.html);
            var ti = encodeURIComponent(data.title);
            require('webpage').create().open(saveUrl, 'post', 'page=' + u + '&title=' + ti + '&html=' + html, function (s) {
                console.log('DONE', url);
                console.log('\n');
                snapshot(urls);
            });
        };
        console.log('RENDER', url);
        setTimeout(takeSnap, 10000);
    });
};

page.open(sitemap, function (status) {
    'use strict';
    if (status !== 'success') {
        console.log('Unable to access network');
        phantom.exit();
    } else {
        var content = page.evaluate(function () {
            return document.body.innerText;
        });
        urls = JSON.parse(content);
        snapshot(urls);
    }
});
