/*jslint node: true*/
var Tag = require('../models/Tag');

module.exports = {
    loadAll: function () {
        'use strict';
        return Tag
            .find({})
            .exec();
    },

    load: function (id) {
        'use strict';
        return Tag
            .findById(id)
            .exec();
    },

    affect: function (tag, post) {
        var alreadyAdded = tag.posts.reduce(function (prev, currentId) {
            return prev || currentId.toString() === post._id.toString();
        }, false);
        if (alreadyAdded) {
            return true;
        }
        tag.posts.push(post);
        tag.save();
    },

    unaffect: function (tagId, postId) {
        'use strict';
        return Tag
            .findByIdAndUpdate(tagId, { $pull: { posts: postId }})
            .exec();
    }
};
