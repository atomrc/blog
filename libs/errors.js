var NotFound = function (msg) {
        this.name = 'Not Found';
        Error.call(this, msg);
        Error.captureStackTrace(this, arguments.callee);
    },

    Unauthorized = function (msg) {
        this.name = 'Unauthorized';
        Error.call(this, msg);
        Error.captureStackTrace(this, arguments.callee);
    },

    ValidationError = function (msg) {
        this.name = 'Validation Failed';
        Error.call(this, msg);
        Error.captureStackTrace(this, arguments.callee);
    };

exports.Unauthorized = Unauthorized;
exports.NotFound = NotFound;

exports.handler = function (err, req, res, next) {
    'use strict';
    var code = 500;
    if (err instanceof NotFound) {
        code = 404;
    }
    if (err instanceof Unauthorized) {
        code = 401;
    }
    if (err instanceof ValidationError) {
        code = 400;
    }
    if (code === 500) { console.log(err.stack); }
    return res.send({error: err.name}, code);
};
