/*global require, exports, module*/
var mongoose = require('mongoose'),
    utils    = require('../libs/utils'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Tag  = require('../models/Tag');

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
    if ( !this.pubdate ) { this.pubdate = Date.now(); }
    if( !this.title || this.slug ) {
        return next();
    }
    this.slug = utils.slugify(this.title);
    next();
});


module.exports = mongoose.model('Post', PostSchema);

