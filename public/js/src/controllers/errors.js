define([], function() {
    var errorsController = {
        notFound: function() {
            var container = document.getElementById("main-content");
            $(container).empty();
            container.innerHTML = "<div class=\"error404\">404</div>";
        }
    };
    return errorsController;
});
