'use strict';

angular.module('insApp')
    .directive('aFiles', function () {
        return {
            restrict: 'E',
            templateUrl: '/app/afile/a-files.html',
            link: function (scope, element, attributes) {
            }
        };
    });