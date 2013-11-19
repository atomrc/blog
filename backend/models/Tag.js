/*global require, exports, module*/
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var TagSchema = new Schema({
        name:        { type: String, required: true },
        posts:       [{ type: Schema.Types.ObjectId, ref: 'Post' }]
    }, {
        versionKey:  "version",
        toJSON: {
            getters: true,
            transform: function (doc, ret, options) {
                'use strict';
                delete ret._id;
                return ret;
            }
        }
    });

module.exports = mongoose.model('Tag', TagSchema);
