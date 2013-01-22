var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var SnapshotSchema = new Schema({
    page: String,
    html: String
});

module.exports = mongoose.model('Snapshot', SnapshotSchema);
