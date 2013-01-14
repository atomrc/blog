define([
        "templates/posts",
        "mustache"
    ], function(postsTemplates, Mustache) {

    var postsViews = {};
    postsViews.Index = Backbone.View.extend({
        initialize: function(options) {
            this.model.bind("reset", this.render.bind(this));
        },

        render: function() {
            this.el.innerHTML = Mustache.render(postsTemplates.index, this.model, postsTemplates);
        },

    });

    postsViews.Show = Backbone.View.extend({ 
        events: {
            "click #publish-button" : "publish",
        },

        initialize: function(options) {
            this.model.bind("change", this.render.bind(this));
        },

        render: function() {
            document.title = this.model.attributes.title;
            this.el.innerHTML = Mustache.render(postsTemplates.show, this.model, postsTemplates);
        },

        publish: function() {
            var oldpub = parseInt(this.model.get("published"));
            var pub = (oldpub+1)%2;
            this.model.set("published", pub);
            this.model.save();
        },
    });

    postsViews.Build = Backbone.View.extend({ 
      events: {
        "keyup input": "formChanged",
        "keyup textarea": "formChanged",
        "submit form": "save",
      },
      render: function() {
        //this.el.innerHTML = Mustache.render(articlesTemplates.show, this.model);
        this.el.innerHTML = Mustache.render(postsTemplates.form, this.model);
      },

      renderFinal:function() {
       // $(this.el).find("article.full-article").replaceWith(Mustache.render(articlesTemplates.show, this.model));
      },

      formChanged: function() {
        var titleValue = $("input#title-field").val();
        var descriptionValue = $("textarea#description-field").val();
        var bodyValue = $("textarea#body-field").val();
        this.model.set("title", titleValue, {silent: true});
        this.model.set("description", descriptionValue, {silent: true});
        this.model.set("body", bodyValue, {silent: true});
        this.renderFinal();
      },

      save: function() {
        this.model.save();
        return false;
      },
    });

    return postsViews;
});
