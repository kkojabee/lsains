'use strict';

angular.module('insApp')
    .controller('ProductCtrl', function ($scope, $http, $stateParams, $q, socket, ApiService, ProductService, ManufacturerService, Enums) {
    $scope.aircraftProduct = null;
    $scope.aircraftProductId = $stateParams.id;
    $scope.newProduct = null;
    $scope.showdetail = false;

    $scope.selectedMfg;
        
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

        $scope.manufacturers = $scope.results['manufacturer'];
        $scope.products = $scope.results['product'];
        $scope.aircrafts = $scope.results['aircraft'];
        
        //setModelFilterData();
        //setTableParams();
        $scope.loadingError = null;
    }, function(err) {
        console.log('error', err);
        $scope.loadingError = err;
    }).finally(function () {
        $scope.dataLoading = false;
    });


    $scope.comptypes = Enums.getEnumArray(Enums.COMP_TYPE);

    $scope.selchange = function() {
        console.log('selectedItem = ', $scope.aircraftProduct._manufacturer);
        //alert('selectedItem = ', $scope.selectedItem);
    }

    $scope.hideDetail = function() {
        $scope.showdetail = false;
    }
    
    $scope.showProduct = function(product) {
        $scope.showdetail = true;
        $scope.aircraftProduct = jQuery.extend(true, {}, product);
    }

    $scope.updateProduct = function(product) {
        console.log('product = ', product);
        ProductService.update(product);
    }
    
    $scope.addProduct = function() {
      if($scope.newProduct === '') {
        return;
      }
      ProductService.add({ model: $scope.newProduct, comp_type: $scope.comptypes[0].value, _manufacturer: $scope.manufacturers[0]._id });
      $scope.newProduct = '';
    };

    $scope.deleteProduct = function(product) {
      ProductService.delete(product._id);
    };

    $scope.$on('product', function (event, data) {
        console.log('product event called', event, data);
        var event = data.event;
        var item = data.item;

        if (event == 'updated') {
            if (item._id == $scope.aircraftProduct._id) {
                $scope.aircraftProduct = jQuery.extend(true, {}, item);
            }
        }
        else if (event == 'deleted') {
            if (item._id == $scope.aircraftProduct._id) {
                $scope.aircraftProduct = null;
                $scope.showdetail = false;
            }
        }
    });
  });