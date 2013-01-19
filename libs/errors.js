var NotFound = function(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

var Unauthorized = function(msg) {
    this.name = 'Unauthorized';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

var ValidationError = function(msg) {
    this.name = 'Validation Failed';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

exports.Unauthorized = Unauthorized;
exports.NotFound = NotFound;

exports.handler = function(err, req, res, next) {
    if (err instanceof NotFound) {
        return res.send({message: 'Not Found'}, 404);
    }
    if (err instanceof Unauthorized) {
        return res.send({message: 'Unauthorized'}, 401);
    }
    if (err instanceof ValidationError) {
        return res.send({message: 'Missing Parameters'});
    }
    return next(err);
}
