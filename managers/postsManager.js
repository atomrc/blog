/*jslint node: true*/
var Post = require('../models/Post'),
    tagsManager = require('../managers/tagsManager');

module.exports = {
    loadAll: function (filter, full, limit) {
        'use strict';
        var condition = filter ? { status: 2 } : {},
            options = limit ?  { limit: limit } : {},
            properties = full ? '' : '-body';

        return Post
            .find(condition, properties, options)
            .sort({'pubdate': 'desc'})
            .populate('tags')
            .exec();
    },

    load: function (id, filter) {
        'use strict';
        if (!filter) {
            //load post without checking its status
            return Post
                .findById(id)
                .populate('tags')
                .exec();
        }

        //load the post and check if its status is published or draft
        return Post
            .findOne({'_id': id, 'status': {$gt: 0} })
            .populate('tags')
            .exec();
    },

    find: function (slug, filter) {
        'use strict';
        var condition = {slug: slug};
        if (filter) {
            condition.status = 2;
        }
        return Post
            .findOne(condition)
            .populate('tags')
            .exec();
    },

    tag: function (post, tag) {
        'use strict';
        var alreadyAdded = post.tags.reduce(function (prev, current) {
            return prev || (current && current._id.toString() === tag._id.toString());
        }, false);
        if (alreadyAdded) {
            return true;
        }
        post.tags.push(tag);
        post.save();
    }
};
