angular.module('insApp')
    .controller('FlightSafetyListCtrl', function ($scope, $http, $stateParams, $filter, $q, $state, $sce, socket, ApiService, Enums) {

    $scope.fsSearch = function(row) {
        if ($scope.fsQuery) {
            var fps = _.filter(row._products, function(product) {
                return angular.lowercase(product.full_name).indexOf(angular.lowercase($scope.fsQuery)) !== -1;
            });
            return ((fps && fps.length > 0) ||
                    (row.pubno && angular.lowercase(row.pubno_full).indexOf(angular.lowercase($scope.fsQuery)) !== -1) ||
                    (row.pubno_sub && angular.lowercase(row.pubno_sub_full).indexOf(angular.lowercase($scope.fsQuery)) !== -1) ||
                    (row.pubno_prv && angular.lowercase(row.pubno_prv).indexOf(angular.lowercase($scope.fsQuery)) !== -1) ||
                    (row.title && angular.lowercase(row.title).indexOf(angular.lowercase($scope.fsQuery)) !== -1));
        }
        else
            return true;
    };

    $scope.fsQuery = '';
    $scope.fsSorkKey = 'pubno';
    $scope.fsSort = function(keyname){
        $scope.fsSortKey = keyname;
        $scope.fsReverse = !$scope.fsReverse;
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