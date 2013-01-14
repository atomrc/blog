define([], function() {
    posts = {
        index: '\
            {{>newpanel}}\
            <ul class="posts-list">\
              {{#models}}\
                {{>list}}\
              {{/models}}\
              {{^models}}\
                Aucun article\
              {{/models}}\
            </ul>\
        ',

        list: '\
          {{#attributes}}\
          <li>\
            <a href="/#!/posts/{{slug}}" class="state">\
                <h2>{{title}}</h2>\
                <div class="pubdate">{{pubdate}}</div>\
                <p class="description">{{description}}</p>\
            </a>\
          </li>\
          {{/attributes}}\
        ',

        show: '\
            {{>editpanel}}\
            {{#attributes}}\
                <article class="full-article">\
                    <header>\
                        <h1>{{title}}</h1>\
                    </header>\
                    <span class="pubdate">{{pubdate}}</span>\
                    <aside id="tags-container"></aside>\
                    <div class="body">{{&body}}</div>\
                </article>\
            {{/attributes}}\
            <div id="comments-container">\
            </div>\
        ',
    }

    return posts;
});
