define(["models/PostsCollection", "models/Post", "models/CommentsCollection", "models/Comment", "views/posts", "views/comments", "views/tags"],
function(PostsCollection, Post, CommentsCollection, Comment, postsViews, commentsViews) {
    postsController = {
        index: function() {
            var collection = new PostsCollection();
            var views = new postsViews.Index({
                model:  collection,
                el:     document.getElementById("main-content"),
            });
            collection.fetch();
        },

        show: function(slug) {
            var post = new Post({id: slug});
            var view = new postsViews.Show({
                model:  post,
                el:     document.getElementById("main-content"),
            });

            var postLoaded = function(post) {
                var commentsView = new commentsViews.Index({
                    model:  new CommentsCollection(post.attributes.comments),
                    el:     document.getElementById("comments-container")
                });
                commentsView.render();

                //adding the comment form
                var commentFormView = new commentsViews.Form({
                    model:  new Comment,
                    el:     document.getElementById("comment-form")
                });
                commentFormView.render();
                //TODO tags
            };

            post.fetch({success: postLoaded});
        },

        build: function() {
            var post = new Post();
            var buildView = new postsViews.Build({
                model:  post,
                el:     document.getElementById("main-content"),
            });
            buildView.render();
        }
    }

    return postsController;
});
