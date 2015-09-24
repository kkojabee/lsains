'use strict';

angular.module('insApp')
    .directive('aImages', function () {
        return {
            restrict: 'E',
            templateUrl: '/app/afile/a-images.html',
            link: function (scope, element, attributes) {
            }
        };
    });

