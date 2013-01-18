exports.show = function(req, res) {
    res.render('partials/' + req.params.view_id, {auth: req.session.auth });
}
