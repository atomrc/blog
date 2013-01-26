exports.index = function(req, res) {
    res.render('index', { auth: req.session.auth, prod: process.env.NODE_ENV !== undefined });
}
