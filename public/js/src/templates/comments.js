define([], function() {
    var comments = {
      index: '\
        <h3> Commentaires </h3>\
        <ul class="comments-list">\
          {{#models}}\
            {{>list}}\
          {{/models}}\
          {{^models}} Pas de commentaires {{/models}}\
        </ul>\
        <div id="comment-form">\
        </div>\
      ',

      list: '\
        {{#attributes}}\
          <li class="comment" id="{{id}}-comment-element">\
            <span class="name">{{name}}</span> - \
            <span class="pubdate">{{pubdate}}</span>\
            <p>{{comment}}</p>\
            {{>editpanel}}\
          </li>\
        {{/attributes}}\
      ',

      form: '\
        <form action="#">\
            <fieldset>\
              <div id="comment-form-notice"></div>\
              <legend> Laisser un commentaire </legend>\
              <label for="name-field">Nom</label>\
              <input type="text" name="name" id="name-field"/><br/>\
              <label for="email-field">Email</label>\
              <input type="text" name="email" id="email-field"/><br/>\
              <label for="comment-field">Commentaire</label>\
              <textarea name="comment" id="comment-field" cols=30 rows=10></textarea><br/>\
              <input type="submit" />\
            </fieldset>\
        </form>\
      '
    }
    return comments;
});
