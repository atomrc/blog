var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({
    id:          ObjectId,
    name:        { type: String, required: true },
    email:       String,
    comment:     String,
    post_slug:   String,
    created_at:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);
