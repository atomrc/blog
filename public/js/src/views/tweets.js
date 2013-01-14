define([
        "templates/tweets",
        "mustache"
    ], function(tweetsTemplates, Mustache) {
    var tweetsViews = {};
    tweetsViews.Index = Backbone.View.extend({
      initialize: function(options) {
        this.model.bind("reset", this.render.bind(this));
      },

      render: function() {
        this.el.innerHTML = Mustache.render(tweetsTemplates.index, this.model, tweetsTemplates);
      },

    });

    return tweetsViews;
});
