define([], function() {
    var Tweet = Backbone.Model.extend({
      url: "/",  

      initialize: function() {
        this.on("change:text", this.parseText.bind(this));
      },

      parseText: function() {
        var refReg = /(@[^ ]+)/;
        var linkReg = /(http:\/\/[^ ]+)/;
        this.attributes.text = this.attributes.text.replace(refReg, "<span class=\"tweet-ref\">$1</span>");
        this.attributes.text = this.attributes.text.replace(linkReg, "<a href=$1>$1</a>");
      }
    });

    return Tweet;
});
