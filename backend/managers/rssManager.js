/*jslint node: true, nomen: true, plusplus: true */
var RSS = require('rss');

module.exports = {
    generate: function (posts) {
        'use strict';
        var feed = new RSS({
                title: 'Why So Curious ?',
                description: 'The web is my scene, HTML5/CSS3 are my sound engineers, JS is my guitar, the web standards are my tablature and last but not least you might be my audience ;)',
                feed_url: 'http://thomasbelin.fr/feed',
                site_url: 'http://thomasbelin.fr',
                image_url: 'http://thomasbelin.fr/favicon.png',
                author: 'Thomas Belin'
            }),
            post,
            xml,
            i;

        /* loop over data and add to feed */
        for (i = 0; i < posts.length; i++) {
            post = posts[i];
            feed.item({
                title:  post.title,
                description: post.body,
                url: 'http://thomasbelin.fr/posts/' + post.slug, // link to the item
                author: 'Thomas Belin', // optional - defaults to feed author property
                date: post.pubdate // any format that js Date can parse.
            });
        }

        return feed.xml();
    }
};
