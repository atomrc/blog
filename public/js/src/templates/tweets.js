define([], function() {
    var tweets = {
      index: '\
        <ul class="tweets-list">\
        {{#models}}\
          {{>list}}\
        {{/models}}\
        </ul>\
      ',

      list: '\
        {{#attributes}}\
        <li class="tweet">\
          {{&text}}\
        </li>\
        {{/attributes}}\
      ',

    }

    return tweets;
});
