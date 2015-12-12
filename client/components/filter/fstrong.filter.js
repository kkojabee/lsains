angular.module('insApp').
  filter('fstrong', ['$sce', function($sce) {
		return function(htmlCode, query) {
			if (!htmlCode || htmlCode === 'null') return null;	
			if (query) {
				var re = new RegExp(query, 'ig');
     		htmlCode = htmlCode.replace(re, '<strong>' + query + '</strong>');
			}
   		return $sce.trustAsHtml(htmlCode);	
 		}
  }
]);