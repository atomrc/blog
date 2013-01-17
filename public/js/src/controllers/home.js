/*global define, document*/
define(
    [
        "jquery",
        "models/PostsCollection",
        "models/TweetsCollection",
        "mustache",
        "templates/home",
        "views/posts",
        "views/tweets"
    ],
    function ($, PostsCollection, TweetsCollection, Mustache, homeTemplates, postsViews, tweetsViews) {
        'use strict';
        var home = {
            index: function () {
                var posts = new PostsCollection(),
                    tweets = new TweetsCollection(),
                    container = document.getElementById("main-content"),
                    tweetsIndex = null,
                    postsIndex = null;

                $(container).empty();
                container.innerHTML = Mustache.render(homeTemplates.index);

                tweetsIndex = new tweetsViews.Index({
                    model: tweets,
                    el: document.getElementById("tweets-container")
                });

                postsIndex = new postsViews.Index({
                    model: posts,
                    el: document.getElementById("posts-container")
                });



                posts.fetch({data: {count: 3}});
                tweets.fetch();
            }
        };

        return home;
});

