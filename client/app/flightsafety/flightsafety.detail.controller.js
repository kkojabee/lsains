'use strict';

angular.module('insApp')
    .controller('FlightSafetyDetailCtrl', function ($scope, $http, $state, $stateParams, $filter, $modal, $q, socket, Enums, dialogs, ApiService) {
        if (!$scope.showdetail || !$scope.flightSafety)
            $state.go('flightsafety.list');
        
        if ($scope.flightSafety != null && $scope.flightSafety._id != null)
            $scope.txtSubmit = "수정";
        else
            $scope.txtSubmit = "추가";

        $scope.file_type = 'SBU';

        $scope.pubNoCheckAsync = function(value) {
            return $q(function(resolve, reject) {
                if ($scope.showcmd !=='add' || !value) return resolve();
                var pubNo = value.toUpperCase();
                ApiService.list('flightsafety', {search :  { $or: [{pubno: pubNo}, {pubno_sub: pubNo}] }}).then(function (results) {
                    if (results.data.count > 0) 
                        reject();
                    else
                        resolve();
                }, function (err) {
                    resolve();
                });     
            });
        }

        $scope.ptypes = [];
        $scope.compTypeChange = function(comp_type) {
            if (!comp_type) return;
            $scope.ptypes = _.filter($scope.products, { 'comp_type': comp_type });

            angular.forEach($scope.flightSafety._products, function (product) {
                _.remove($scope.ptypes, {_id: product._id});
            });

            if ($scope.ptypes && $scope.ptypes.length > 0)
                $scope.product = $scope.ptypes[0];
        }

        if (angular.isDefined($scope.flightSafety.comp_type))
            $scope.compTypeChange($scope.flightSafety.comp_type);

        $scope.delProduct = function(product) {
            if (!product)
                return;
            _.remove($scope.flightSafety._products, {_id: product._id});
            $scope.compTypeChange($scope.flightSafety.comp_type);
        }

        $scope.addProduct = function() {
            if (!$scope.product)
                return;
            if (!$scope.flightSafety._products)
                $scope.flightSafety._products = [];
            $scope.flightSafety._products.push($scope.product);
            $scope.compTypeChange($scope.flightSafety.comp_type);   
        }        

        var isPopulated = function(obj) {
            if (obj !== undefined && obj._id !== undefined)
                return true;
            else 
                return false;
        }

        var deleteNewFiles = function(doc) {
            var newafiles = _.pluck(_.filter(doc._afiles, { 'isnew': true }), '_id');
            newafiles = newafiles.concat(_.pluck(_.filter(doc._aimages, { 'isnew': true }), '_id'));
            newafiles.forEach(function (id) {
                ApiService.delete('afile', id);
            });
        }
        
        $scope.dataLoading = false;
        $scope.updateFlightSafety = function(flightSafety) {
            $scope.dataLoading = true;
            $scope.saving = true;
            $scope.updating = true;

            if(!$scope.showPubNo) {
                $scope.flightSafety.pubno_sub = null;
                $scope.flightSafety.pubno_sub_rev = null;
            }

            if ($scope.showcmd === 'add') {
                ApiService.add('flightsafety', flightSafety)
                    .then(function (results) {
                        dialogs.notify('Notification', flightSafety.pubno + ' created successfully.');
                    }, function (err) {
                        console.log('then err called, err: ', err);
                        dialogs.error('Error', err);
                    }).finally(function () {
                        $scope.dataLoading = false;
                        $scope.saving = false;
                    });    
            }
            else {
                ApiService.update('flightsafety', flightSafety)
                    .then(function (results) {
                        dialogs.notify('Notification', flightSafety.pubno + ' updated successfully.');
                    }, function (err) {
                        console.log('then err called, err: ', err);
                        dialogs.error('Error', err);
                    }).finally(function () {
                        $scope.dataLoading = false;
                        $scope.saving = false;
                    });    
            }
            
        };
    
        $scope.deleteFlightSafety = function(flightSafety) {
            var dlg = dialogs.confirm('Confirmation', flightSafety.pubno + '를 삭제하시겠습니까?');
            dlg.result.then(function (btn) {
                // delete newly attached files (these files are not included in flightSafety DB)
                deleteNewFiles(flightSafety);

                ApiService.delete('flightsafety', flightSafety._id)
                    .then(function (results) {
                        dialogs.notify('Notification', flightSafety.pubno + ' deleted successfully.');
                        _.remove($scope.flightSafetys, { _id: flightSafety._id });
                        $state.go('flightsafety.list');
                    }, function (err) {
                        console.log('then err called, err: ', err);
                        dialogs.error('Delete Error', err);
                    }).finally(function () {
                        $scope.dataLoading = false;
                        $scope.saving = false;
                    });
            }, function (btn) {
            });        
        };

        $scope.$on('flightsafety', function (event, data) {
            var event = data.event;
            var item = data.item;

            console.log('on flightsafety: event, data', event, data);

            if (event == 'updated') {
                if (item._id == $scope.flightSafety._id && item.event_no != $scope.flightSafety.event_no) {
                    $scope.flightSafety = jQuery.extend(true, {}, item);
                    $scope.afiles = $scope.flightSafety._afiles;
                    $scope.aimages = $scope.flightSafety._aimages;
                }
            }
            else if (event == 'deleted') {
                if (item._id == $scope.flightSafety._id) {
                    $scope.flightSafety = null;
                    $scope.showdetail = false;
                    $state.go('flightSafety.list');
                }
            }
        });

        $scope.$on('product', function (event, data) {
            var event = data.event;
            var item = data.item;
            if (event == 'updated') {
                var products = $scope.flightSafety._products;
                var oldItem = _.find(products, { _id: item._id });
                if (oldItem) {
                    var index = array.indexOf(products);
                    products.splice(index, 1, item);
                }
            }
        });
    });