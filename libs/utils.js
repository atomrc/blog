exports.slugify = function(text) {
    'use strict';
    text = text.replace(/[àáâãäå]/g, 'a');
    text = text.replace(/ç/g, 'c');
    text = text.replace(/[èéêë]/g, 'e');
    text = text.replace(/[^-a-zA-Z0-9\s]+/ig, '');
    text = text.replace(/(\s){2,5}/ig, '');
    text = text.replace(/\s/gi, "-");
    return text;
}

