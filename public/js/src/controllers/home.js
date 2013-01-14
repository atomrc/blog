define([
        "models/PostsCollection", 
        "models/TweetsCollection", 
        "mustache",
        "templates/home",
        "views/posts",
        "views/tweets",
    ],
    function(PostsCollection, TweetsCollection, Mustache, homeTemplates, postsViews, tweetsViews) {
    var home = {
        index: function() {
            var posts = new PostsCollection();
            var tweets = new TweetsCollection();

            var container = document.getElementById("main-content");
            $(container).empty();
            container.innerHTML = Mustache.render(homeTemplates.index);

            var tweetsIndex = new tweetsViews.Index({
                model: tweets,
                el: document.getElementById("tweets-container"),
            });

            var postsIndex = new postsViews.Index({
                model: posts,
                el: document.getElementById("posts-container"),
            });

            posts.fetch({data: {count: 3}});
            tweets.fetch();
        }
    }

    return home;
});

