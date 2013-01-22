/*global require, define, angular, window*/
var snapshots = function ($scope, $http, $window) {
    $scope.snapshot = function () {
        var content = angular.element($window.document.documentElement);
        var adminPanels = content.find('admin');
        adminPanels.remove();
        $http.post('/snapshot', { 'html': content.html(), 'page': $window.document.location.hash });
    }
};
