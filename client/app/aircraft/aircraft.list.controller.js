angular.module('insApp')
    .controller('AircraftListCtrl', function ($scope, $http, $stateParams, $filter, $q, $state, socket, ApiService, Enums) {

    $scope.aircraftSearch = function(row) {
        if ($scope.aircraftQuery) {
            return (angular.lowercase(row.reg_no).indexOf(angular.lowercase($scope.aircraftQuery)) !== -1 ||
                    angular.lowercase(row.model).indexOf(angular.lowercase($scope.aircraftQuery)) !== -1 ||
                    angular.lowercase(row.owner).indexOf(angular.lowercase($scope.aircraftQuery)) !== -1 );
        }
        else
            return true;
    };

    $scope.aircraftSortKey = 'reg_no';
    $scope.aircraftSort = function(keyname){
        $scope.aircraftSortKey = keyname;
        $scope.aircraftReverse = !$scope.aircraftReverse;
    };
});