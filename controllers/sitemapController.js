var Snapshot = require('../models/Snapshot'),
    Post = require('../models/Post');

exports.index = function(req, res) {
    var root = 'http://thomasbelin.fr',
        sitemap = '',
        priority = 0.8,
        i;

    if (req.params.format === "xml" ) {
        sitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        for(var i in req.urls) {
            sitemap += '<url>';
            sitemap += '<loc>'+ root + req.urls[i] + '</loc>';
            sitemap += '<priority>'+ priority +'</priority>';
            sitemap += '</url>';
        }
        sitemap += '</urlset>';
    } else {
        sitemap = [];
        for(i = 0; i < req.urls.length; i++) {
            sitemap.push(req.urls[i]);
        }
    }

    res.send(sitemap);
};
