/*global require, console, phantom*/
var page = require('webpage').create(),
    apikey = require('../config/parameters.js').apikey,
    root = 'http://thomasbelin.fr',
    //root = 'http://localhost:3000',
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
                 var content = '<!DOCTYPE html>' + window.document.documentElement.outerHTML;
                 loc = window.location.pathname;
                 return { html: content, page: loc };
            });
            console.log('SAVE', url);
            var u = encodeURIComponent(data.page);
            var html = encodeURIComponent(data.html);
            require('webpage').create().open(saveUrl, 'post', 'page=' + u + '&html=' + html, function (s) {
                console.log('DONE', url);
                console.log('\n');
                snapshot(urls);
            });
        };
        console.log('RENDER', url);
        setTimeout(takeSnap, 30000);
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
        urls.push('/404');
        snapshot(urls);
    }
});
