angular.module('insApp')
    .controller('CertificateListCtrl', function ($scope, $http, $stateParams, $filter, $q, $state, $sce, socket, ApiService, Enums) {

    $scope.ceSearch = function(row) {
        if ($scope.ceQuery) {            
            return ((fps && fps.length > 0) ||
                    (row.pubno && angular.lowercase(row.pubno_full).indexOf(angular.lowercase($scope.ceQuery)) !== -1) ||
                    (row.pubno_sub && angular.lowercase(row.pubno_sub_full).indexOf(angular.lowercase($scope.ceQuery)) !== -1) ||
                    (row.pubno_prv && angular.lowercase(row.pubno_prv).indexOf(angular.lowercase($scope.ceQuery)) !== -1) ||
                    (row.title && angular.lowercase(row.title).indexOf(angular.lowercase($scope.ceQuery)) !== -1))
        }
        else
            return true;
    };

    $scope.ceType = function(row) {
        if ($scope.chkTmp && $scope.chkRgl) 
            return true;
        if ($scope.chkTmp && row.type == 'TMP') 
            return true;
        if ($scope.chkRgl && row.type == 'RGL') 
            return true;
    };

    $scope.ceQuery = '';
    $scope.ceSorkKey = 'pubno';
    $scope.ceSort = function(keyname){
        $scope.ceSortKey = keyname;
        $scope.ceReverse = !$scope.ceReverse;
    };

    $scope.$on('product', function (event, data) {
        var event = data.event;
        var item = data.item;
        if (event == 'updated') {
            var fltsfts = _.find($scope.flightsafeties, { _products: {_id: item._id }})
            fltsfts.forEach(function(fltsft) {
                var products = fltsfts._products;
                var oldItem = _.find(products, { _id: item._id });
                if (oldItem) {
                    var index = array.indexOf(products);
                    products.splice(index, 1, item);
                }
            });
        }
    });
});