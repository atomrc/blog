var Post = require('../models/Post');

exports.index = function(req, res) {
    var root = 'http://blog.thomasbelin.fr/#!',
        urls = ['/', '/posts'],
        sitemap = '',
        priority = 0.8;
    var posts = Post.find({published: true}, function (err, posts) {
        if( err ) throw new NotFound;
        for(var i in posts) {
            var post = posts[i];
            urls.push('/posts/'+post.slug);
        }

        sitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        for(var i in urls) {
            sitemap += '<url>';
            sitemap += '<loc>'+ root + urls[i] + '</loc>';
            sitemap += '<priority>'+ priority +'</priority>';
            sitemap += '</url>';
        }
        sitemap += '</urlset>';

        res.send(sitemap);
    });
}
