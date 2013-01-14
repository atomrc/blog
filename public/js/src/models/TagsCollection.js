define(["models/Tag"], function(Tag) {
    var TagsCollection = Backbone.Collection.extend({
        model: Tag,
    });

    return TagsCollection;
});
