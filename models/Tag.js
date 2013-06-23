/*global require, exports, module*/
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var TagSchema = new Schema({
    id:          ObjectId,
    name:        { type: String, required: true },
    posts:       [{ type: Schema.Types.ObjectId, ref: 'Post' }]
});

module.exports = mongoose.model('Tag', TagSchema);
