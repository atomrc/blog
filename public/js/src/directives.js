/*global define*/

define([],
    function () {
        'use strict';
        var draggable = function ($document) {
            var startX = 0, startY = 0, x = 0, y = 0;
            return function (scope, element, attr) {
                element.css({
                    position: 'absolute',
                    cursor: 'move'
                });
                element.bind('mousedown', function(event) {
                    startX = event.screenX - x;
                    startY = event.screenY - y;
                    $document.bind('mousemove', mousemove);
                    $document.bind('mouseup', mouseup);
                });

                function mousemove(event) {
                    y = event.screenY - startY;
                    x = event.screenX - startX;
                    element.css({
                        top: y + 'px',
                        left:  x + 'px'
                    });
                }

                function mouseup() {
                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);
                }
            };

        draggable.$inject = ['$document'];

        };
        return {
            draggable: draggable
        };
    }
);

