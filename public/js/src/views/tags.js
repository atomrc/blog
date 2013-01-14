define(["templates/tags"], function(tagsTemplates) {
    var tagsViews = {};
    tagsViews.Index = Backbone.View.extend({
      initialize: function(options) {
        this.model.bind("reset", this.render.bind(this));
      },

      render: function() {
        this.el.innerHTML = Mustache.render(BlogApp.Templates.Tags.index, this.model, BlogApp.Templates.Tags);
      },

    });
});
