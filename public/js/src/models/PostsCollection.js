define(["backbone", "models/Post"], function(Back, Post) {
    var Posts = Backbone.Collection.extend({
        model: Post,
        url: "/posts",
    });

    return Posts;
});
