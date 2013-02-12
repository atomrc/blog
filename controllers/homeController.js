exports.index = function(req, res) {
    res.render('index', { auth: req.session.auth, prod: req.app.get('env') === 'prod' });
}
