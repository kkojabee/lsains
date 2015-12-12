'use strict';

angular.module('insApp')
    .controller('FlightSafetyCtrl', function ($scope, $http, $stateParams, $filter, $q, $state, socket, ApiService, Enums, dialogs) {
    $scope.flightSafety = null;
    $scope.flightSafetyId = $stateParams.id;
    $scope.newFlightSafety = null;
    $scope.showdetail = false;
    $scope.enums = Enums;
    $scope.aTypes = null;
    $scope.dataLoading = true;
    $scope.results = [];
    $scope.models = null;

    $q.all([
        ApiService.async('manufacturer'), 
        ApiService.async('product'), 
        ApiService.async('aircraft'),
        ApiService.async('flightsafety')
    ]).then(function(response) {
        angular.forEach(response, function(data) {
            $scope.results[data.type] = data.result;
        });

        $scope.manufacturers = $scope.results['manufacturer'];
        $scope.products = $scope.results['product'];
        $scope.aircrafts = $scope.results['aircraft'];
        $scope.flightsafeties =  $scope.results['flightsafety'];

        $scope.loadingError = null;
    }, function(err) {
        console.log('error', err);
        $scope.loadingError = err;
    }).finally(function () {
        $scope.dataLoading = false;
    });

    var getSubDocs = function(flightSafety) {
        console.log('getSubDocs: ', flightSafety);
       /* sub functions */
        var getProducts = function(flightSafety) {
            var products = [];
            flightSafety._products.forEach(function(product) {
                var prd_id = null;
                if (product._id === undefined) 
                    prd_id = product
                else
                    prd_id = product._id;

                var product = _.find($scope.products, { _id: prd_id });
                if (!product)
                    console.log('product find error!');
                else {
                    products.push(product);
                }
            });
            flightSafety._products = products;
        }
        getProducts(flightSafety);
    }

   $scope.showFlightSafety = function(flightSafety) {
        $scope.flightSafety = jQuery.extend(true, {}, flightSafety);
        getSubDocs($scope.flightSafety);

        if (!angular.isDefined($scope.flightSafety._afiles))
            $scope.flightSafety._afiles = [];
        if (!angular.isDefined($scope.flightSafety._aimages))
            $scope.flightSafety._aimages = [];
        $scope.afiles = $scope.flightSafety._afiles;
        $scope.aimages = $scope.flightSafety._aimages;
        $scope.showdetail = true;
        $scope.showcmd = 'mod';
    };

    /* addAircraft: temporory function */
    $scope.addFlightSafety = function(lsa_cat) {
        $scope.flightSafety = {
            type: 'SB',
            valid: true,
            mandatory: false,
            repeat: false,
            _afiles: [],
            _aimages: []
        };
        $scope.afiles = $scope.flightSafety._afiles;
        $scope.aimages = $scope.flightSafety._aimages;
        
        $scope.showcmd = 'add';
        $scope.showimage = false;
        $scope.showdetail = true;

        //test code...
        /*
        $scope.flgithSafety = {
            lsa_category: 'LSA',
            lsa_type: 'AIRPLANE',
            reg_no: 'HL-C001',
            sn: '1234',
            reg_status: 'REG',
            reg_date: '2009-09-16',
            model: 'P92 Eaglet',
            mfg_date: '2008-11-18',
            no_seat: 2,
            gear_type: 'LAND',
            owner: '김현식',
            phone: '010-3540-1982',
            place: '경북 구미시 선산동 원리 1057-166 푸른하늘 비행장',
            region: 'KB',
            acenter: 'BC',
            reg_type: 'NEW',
            ins_due: ''
        };
        */
        //

        $state.go('flightsafety.detail');
    };
});