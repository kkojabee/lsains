'use strict';

angular.module('insApp')
    .directive('cert', function () {
        return {
            restrict: 'E',
            template: '<div ng-include="getContentUrl()"></div>',
            link: function (scope, element, attrs) {
            	scope.getContentUrl = function() {
                    return '/app/template/cert-' + attrs.lsaCategory + '-' + attrs.type.toLowerCase() + '.html';
           		}
            }
        };
    });