BlogApp.Controllers.about = {
  index: function() {
    var container = document.getElementById("main-content"); 
    $(container).empty();
    var about = new About();
    var success = function(about) {
      $(container).html(Mustache.render(aboutViews.index, about));
    }
    about.load(success);
  }
}
