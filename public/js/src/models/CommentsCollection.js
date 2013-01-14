define(["models/Comment"], function(Comment) {
    var CommentsCollection = Backbone.Collection.extend({
        model: Comment,
    });

    return CommentsCollection;
});
