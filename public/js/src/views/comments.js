define(["templates/comments", "mustache"], function(commentsTemplates, Mustache) {
    var commentsViews = {};
    commentsViews.Index = Backbone.View.extend({
        events: {
            "click .delete" : function(ev) {
                var commentId = parseInt(ev.target.id);
                var comment = $.grep(this.model.models, function(element, index) {
                    return element.id == commentId;
                });
                if(!confirm("sure bro ?")) return false;
                this.model.remove(comment);
                return false; 
            },
        },

        initialize: function(options) {
            this.model.bind("reset", this.render.bind(this));
            this.model.bind("remove", this.remove.bind(this));
        },

        render: function() {
            this.el.innerHTML = Mustache.render(commentsTemplates.index, this.model, commentsTemplates);
        },

        remove: function(comment) {
            $(this.el).find("#"+comment.id+"-comment-element").remove();
            comment.destroy();
        },

    });

    commentsViews.Form = Backbone.View.extend({
        events: {
            "submit form": "save",
            "keyup input": "formChanged",
            "keyup textarea": "formChanged",
        },

        initialize: function(options) {
        },

        render: function() {
            this.el.innerHTML = Mustache.render(commentsTemplates.form, this.model);
        },

        formChanged: function(ev) {
            var nameValue = $("input#name-field").val();
            var emailValue = $("input#email-field").val();
            var commentValue = $("textarea#comment-field").val();
            this.model.set("name", nameValue, {silent: true});
            this.model.set("email", emailValue, {silent: true});
            this.model.set("comment", commentValue, {silent: true});
        },

        save: function() {
            var noticeContainer = document.getElementById("comment-form-notice");
            if(this.model.isValid()) {
                this.model.save();
                noticeContainer.className = "success";
                $(noticeContainer).html("Merci,<br/>je prends bonne note de votre commentaire et le publierai dans les prochains jours :)");
            }else{
                noticeContainer.className = "error";
                $(noticeContainer).html(this.model.validate(this.model.attributes));
            }
            return false;
        }
    });

    return commentsViews;
});
