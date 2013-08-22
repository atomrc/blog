/*global require, exports, module*/
var mongoose = require('mongoose'),
    utils    = require('../libs/utils'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Tag  = require('../models/Tag'),
    fillMandatories = function (post) {
        'use strict';
        if (!post.pubdate) { post.pubdate = Date.now(); }
        if (!post.title || post.slug) {
            return;
        }
        post.slug = utils.slugify(post.title);
    };

var PostSchema = new Schema({
    title:        String,
    description:  String,
    body:         String,
    slug:         String,
    status:       { type: Number, 'default': 0 },
    pubdate:      { type: Date, 'default': Date.now },
    tags:         [{ type: Schema.Types.ObjectId, ref: 'Tag' }]
}, { versionKey:  "version" });

PostSchema.pre('save', function (next) {
    'use strict';
    fillMandatories(this);
    next();
});


module.exports = mongoose.model('Post', PostSchema);

