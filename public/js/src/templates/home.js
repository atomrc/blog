define([], function() {
    var homeTemplates = {
      index: '\
        <div id="welcome"> Bienvenue </div>\
        <div class="widget">\
          <div class="widget-title"> Mes derniers posts </div>\
          <div id="posts-container" class="widget-container"></div>\
        </div>\
        <div class="widget">\
          <div class="widget-title"> Mes derniers tweets </div>\
          <div id="tweets-container" class="widget-container"></div>\
        </div>\
      ',

      postsList: '\
        <ul class="posts-list">\
          {{#models}}\
            {{>list}}\
          {{/models}}\
          {{^models}}\
            Aucun post\
          {{/models}}\
        </ul>\
      ',

    }

    return homeTemplates;
});
