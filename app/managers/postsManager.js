/*jslint node: true*/
var Post = require('../models/Post'),
    tagsManager = require('../managers/tagsManager'),
    STATUS_UNPUBLISHED = 0,
    STATUS_DRAFT = 1,
    STATUS_PUBLISHED = 2;

module.exports = {
    loadAll: function (filter, full, limit) {
        'use strict';
        var condition = filter ? { status: STATUS_PUBLISHED } : {},
            options = limit ?  { limit: limit } : {},
            properties = full ? '' : '-body -bodySrc';

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
            .findOne({'_id': id, 'status': {$gt: STATUS_UNPUBLISHED}}, '-bodySrc')
            .populate('tags')
            .exec();
    },

    find: function (slug, filter) {
        'use strict';
        var condition = {slug: slug},
            properties = '';
        if (filter) {
            condition.status = STATUS_PUBLISHED;
            properties = '-bodySrc';
        }
        return Post
            .findOne(condition, properties)
            .populate('tags')
            .exec();
    },

    findRelated: function (post) {
        'use strict';
        var relatedPosts = [],
            orderedPosts = {},
            maxMatch = 0,
            maxTotalRelated = 3,
            matches = [],
            i;

        //retrieving all the posts of all the tags of the current post
        post.tags.forEach(function (tag) {
            tag.posts.forEach(function (postId) {
                relatedPosts.push(postId);
            });
        });

        //counting times a single post appears in the list of posts
        relatedPosts.forEach(function (postId) {
            if (postId.toString() === post.id.toString()) { return; }

            orderedPosts[postId] = orderedPosts[postId] ?
                    orderedPosts[postId] + 1 :
                    1;

            maxMatch = Math.max(orderedPosts[postId], maxMatch);
        });

        //grouping all the posts that have the maximum number of tags commun with the current post
        for (i in orderedPosts) {
            if (orderedPosts.hasOwnProperty(i)) {
                if (orderedPosts[i] === maxMatch) {
                    matches.push(i);
                }
            }
        }

        return Post
            .find({ '_id': { $in: matches}, status: STATUS_PUBLISHED })
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
