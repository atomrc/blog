(function () {
    'use strict';
    /***************************************/
    /*************** EXTENSIONS ***************/
    /***************************************/
    Array.prototype.removeElement = function (element) {
        this.splice(this.indexOf(element), 1);
    };
}());
