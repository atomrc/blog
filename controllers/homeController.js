exports.index = function(req, res) {
    res.render('index', { auth: req.user });
}
