define(["models/Tweet"], function(Tweet) {
    var TweetsCollection = Backbone.Collection.extend({
      model: Tweet, 
      url: "http://api.twitter.com/1/statuses/user_timeline.json?count=10&include_rts=true&screen_name=thomasbelin4",
      
      initialize: function() {
        this.on("reset", function() {
          for(var index in this.models) {
            this.models[index].trigger("change:text");
          }
        });
      },

      sync: function(method, model, options){  
        options.dataType = "jsonp";  
        return Backbone.sync(method, model, options);  
      }  
    });

    return TweetsCollection;
});
