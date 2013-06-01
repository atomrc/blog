/*global require, exports*/
var https = require('https');

exports.index = function (req, res) {
    'use strict';
    var callback = req.query.callback,
        url = req.query.url,
        options,
        request,
        datas = '';
    switch (req.params.provider) {
    case 'google':
        options = {
            host: 'clients6.google.com',
            path: '/rpc',
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        };

        request  = https.request(options, function (response) {
            response.on('data', function (chunk) {
                datas += chunk.toString('utf8');
            });
            response.on('end', function () {
                datas = JSON.parse(datas);
                res.write(callback + '({count: ' + datas[0].result.metadata.globalCounts.count + '})');
                res.end();
            });
        });

        request.write('[{"method":"pos.plusones.get","id":"p","params":{"nolog":true,"id":"' + url + '","source":"widget","userId":"@viewer","groupId":"@self"},"jsonrpc":"2.0","key":"p","apiVersion":"v1"}]');

        request.end();
        break;
    }
};
