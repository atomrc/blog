define([], function() {
    var monthNames = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];

    var tools = {
        formatDate: function(timestamp) {
          var date = new Date(parseInt(timestamp)*1000);
          var day = date.getDate();
          var month = date.getMonth();
          var year = date.getFullYear();
          return "" + day + " " + monthNames[month] + " " + year;
        },

        initAjaxLinks: function() {
          $("a[data-remote]").click(function() {
            if(this.className != "delete" || confirm("Sure bro ?")) {
            var href = $(this).attr("href");
            application.route(null, href);
            return false;
            } else {
              return false;
            }
          });
        },

        initAjaxForm: function() {
          var forms = $("form[data-remote]"); 
          forms.submit(function(index, form) {
            var datas = {};
            $(this).find("input, textarea").each (function(index, tag) {
              if(tag.name) datas[tag.name] = tag.value;
            });
            application.route(null, $(this).attr("action"), datas);
            return false;
          });
        },
    };

    return tools;
});
