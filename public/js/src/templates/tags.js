define([], function() {
    tags = { 
      index: '\
        {{#models}}\
        <span><b>Tags :</b></span>\
        <ul id="tags-list">\
            {{>list}}\
        </ul>\
        {{/models}}\
      ',

      list: '\
        {{#attributes}}\
          <li class="tag" id="{{id}}-tag">\
            <small class="name">{{name}}</small>\
            {{>editpanel}}\
          </li>\
        {{/attributes}}\
      ',
    };

    return tags;
});
