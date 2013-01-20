var mongoose = require('mongoose'),
    utils    = require('../libs/utils'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Comment  = require('../models/Comment'),
    Tag  = require('../models/Tag');

var PostSchema = new Schema({
    id:           ObjectId,
    title:        String,
    description:  String,
    body:         String,
    slug:         String,
    published:    {type: Boolean, default: false},
    pubdate:      {type: Date, default: Date.now},
    comments:     [Comment.schema],
    tags:         [Tag.schema]
}, { versionKey:  "version" });

PostSchema.pre('save', function(next) {
    if( !this.title ) next();
    this.slug = utils.slugify(this.title);
    next();
});


module.exports = mongoose.model('Post', PostSchema);

