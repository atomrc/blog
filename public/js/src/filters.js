/*global define*/

define([],
    function () {
        'use strict';
        var urlconvert;

        urlconvert = function () {
            return function (input) {
                var parsedText = input,
                    refReg = /(@[^ ]+)/g,
                    linkReg = /(http[s]?:\/\/[^ ]+)/g;
                parsedText = parsedText.replace(refReg, "<span class=\"tweet-ref\">$1</span>");
                parsedText = parsedText.replace(linkReg, "<a href=$1>$1</a>");
                return parsedText;
            };
        };

        return {
            urlconvert: urlconvert
        };
    }
);

