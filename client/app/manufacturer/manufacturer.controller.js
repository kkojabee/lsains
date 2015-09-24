'use strict';

angular.module('insApp')
    .controller('ManufacturerCtrl', function ($scope, $http, $stateParams, $q, socket, ApiService, ManufacturerService, Enums) {
    $scope.aircraftManufacturer = null;
    $scope.aircraftManufacturerId = $stateParams.id;
    $scope.newMfg = null;
    $scope.showdetail = false;

    $scope.dataLoading = true;
    $scope.results = [];
    $q.all([
        ApiService.async('manufacturer'), 
        ApiService.async('product'), 
        ApiService.async('aircraft')
    ]).then(function(response) {
        angular.forEach(response, function(data) {
            $scope.results[data.type] = data.result;
        });

        $scope.aircraftManufacturers = $scope.results['manufacturer'];
        $scope.products = $scope.results['product'];
        $scope.aircrafts = $scope.results['aircraft'];
        
        setModelFilterData();
        setTableParams();
        $scope.loadingError = null;
    }, function(err) {
        console.log('error', err);
        $scope.loadingError = err;
    }).finally(function () {
        $scope.dataLoading = false;
    });

        
    $scope.hideDetail = function() {
        $scope.showdetail = false;
    }
    
    $scope.showManufacturer = function(manufacturer) {
        $scope.showdetail = true;
        $scope.aircraftManufacturer = jQuery.extend(true, {}, manufacturer);
    }

    $scope.updateManufacturer = function(manufacturer) {
        ManufacturerService.update(manufacturer);
    }
    
    $scope.addManufacturer = function() {
      if($scope.newManufacturer === '') {
        return;
      }
      ManufacturerService.add({ name: $scope.newManufacturer });
      $scope.newManufacturer = '';
    };

    $scope.deleteManufacturer = function(manufacturer) {
      ManufacturerService.delete(manufacturer._id);
    };

    $scope.$on('manufacturer', function (event, data) {
        console.log('manufacturer event called', event, data);
        var event = data.event;
        var item = data.item;

        if (event == 'updated') {
            if (item._id == $scope.aircraftManufacturer._id) {
                $scope.aircraftManufacturer = jQuery.extend(true, {}, item);
            }
        }
        else if (event == 'deleted') {
            if (item._id == $scope.aircraftManufacturer._id) {
                $scope.aircraftManufacturer = null;
                $scope.showdetail = false;
            }
        }
    });
  });