'use strict';

angular.module('insApp')
    .directive('ngFicon', ['$window', function ($window) {
        var helper = {
            getFiconPath: function (fname) {
                var ext = fname.split('.').pop();
                return '/assets/images/ficons/' + ext + '_small.bmp';
            }
        };

        return {
            restrict: 'A',
            template: '<img alt="file icon"/>',
            link: function (scope, element, attributes) {
                var params = scope.$eval(attributes.ngFicon);
                if (!params.fname) return;

                var path = helper.getFiconPath(params.fname);
                var img = element.find('img');
                img.attr({ src: path, width: 16, height: 16, onerror: "this.src='/assets/images/ficons/unk_small.bmp'" });
            }
        };
    } ]);