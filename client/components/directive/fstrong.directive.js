'use strict';

angular.module('insApp')
    .directive('fstrong', function ($compile) {
        var helper = {
            strong: function (html, query) {
                if (!html) return null;
                if (!query) return html;
                var re = new RegExp(query, 'ig');
                return html.replace(re, '<strong>' + query + '</strong>');
            }
        };
        return {
            restrict: 'E',
            scope: {
                fstrong: "@",
                query: "@"
            },
            link: function (scope, ele, attrs) {
                console.log('link attrs.query: ', attrs.query);
                scope.$watch(scope.fstrong, function(html) {
                    console.log(' scope.fstrong: ', scope.fstrong);
                    if (attrs.query) {
                        ele.html(helper.strong(html));
                        $compile(ele.contents())(scope);   
                    }
                });
            }
        };
  });
