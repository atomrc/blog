define([
        "backbone",
        "tools",
    ], function(Back, tools) {
    var Post = Backbone.Model.extend({
        urlRoot: "/posts",
        url: function() {
            if(this.id) {
                return this.urlRoot+"/"+ this.getPermalink();
            }
            return this.urlRoot;
        },

        initialize: function() {
        },

        pubdate: function() {
            return tools.formatDate(this.created_at);
        },

        isPublished: function() {
            return this.published != 0;
        },

        getPermalink: function() {
            return this.get("slug") || this.id;
        },

    });

    return Post;
});
