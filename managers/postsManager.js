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

    findSimilar: function (post) {
        'use strict';
        var relatedPosts = [],
            orderedPosts = {},
            maxMatch = 0,
            matches = [],
            i;

        post.tags.forEach(function (tag) {
            tag.posts.forEach(function (postId) {
                relatedPosts.push(postId);
            });
        });

        relatedPosts.forEach(function (postId) {
            if (!orderedPosts[postId]) {
                orderedPosts[postId] = 0;
            }
            orderedPosts[postId] = orderedPosts[postId] + 1;
            if (orderedPosts[postId] > maxMatch) {
                maxMatch = orderedPosts[postId];
            }
        });

        for (i in orderedPosts) {
            if (orderedPosts.hasOwnProperty(i)) {
                if (orderedPosts[i] === maxMatch) {
                    matches.push(i);
                }
            }
        }

        return Post
            .find({ '_id': { $in: matches}})
            .populate('tags')
            .exec();
    },

    tag: function (post, tag) {
        'use strict';
        var alreadyAdded = post.tags.reduce(function (prev, current) {
            return prev || (current && current.id.toString() === tag.id.toString());
        }, false);
        if (alreadyAdded) {
            return true;
        }
        post.tags.push(tag);
        post.save();
    },

    untag: function (postId, tagId) {
        'use strict';
        return Post
            .findByIdAndUpdate(postId, { $pull : { tags: tagId }})
            .populate('tags')
            .exec();
    }
};
