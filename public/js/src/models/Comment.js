define(["tools"], function(tools) {
    var Comment = Backbone.Model.extend({
        initialize: function() {
            if(this.id) {
                return "/posts/"+ this.post_slug +"/comments/"+this.id;
            }
            return "/posts/"+ this.post_slug +"/comments";
        },

        validate: function(attrs) {
            if(!attrs.name) { return "Vous devez definir un nom"; }
            if(!attrs.email) { return "Vous devez definir un email"; }
            var emailReg = /.*@.*\.[a-zA-Z]*/;
            if(!attrs.email.match(emailReg)) { return "L'email n'est pas valide"; }
            if(!attrs.comment) { return "Vous n'avez ecrit aucun commentaire"; }
        },

        pubdate: function() {
            return tools.formatDate(this.created_at);
        },
    });

    return Comment;
});
