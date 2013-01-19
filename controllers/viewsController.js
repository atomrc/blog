exports.show = function(req, res) {
    var path = req.params.view_id.replace('_', '/');
    res.render('partials/' + path, {auth: req.session.auth });
}
