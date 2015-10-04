'use strict';

angular.module('insApp')
    .controller('AircraftCtrl', function ($scope, $http, $stateParams, $filter, $q, $state, socket, ApiService, Enums, dialogs) {
    $scope.aircraft = null;
    $scope.aircraftId = $stateParams.id;
    $scope.newAircraft = null;
    $scope.showdetail = false;
    $scope.enums = Enums;
    $scope.aTypes = null;
    $scope.showulvno = true;
    $scope.dataLoading = true;
    $scope.results = [];
    $scope.models = null;

    $q.all([
        ApiService.async('manufacturer'), 
        ApiService.async('builder'), 
        ApiService.async('product'), 
        ApiService.async('aircraft'),
        ApiService.async('owner'),
    ]).then(function(response) {
        angular.forEach(response, function(data) {
            $scope.results[data.type] = data.result;
        });

        $scope.manufacturers = $scope.results['manufacturer'];
        $scope.builders = $scope.results['builder'];
        $scope.products = $scope.results['product'];
        $scope.aircrafts = $scope.results['aircraft'];
        $scope.owners  = $scope.results['owner'];
        
        setModelFilterData();
        $scope.loadingError = null;
    }, function(err) {
        console.log('error', err);
        $scope.loadingError = err;
    }).finally(function () {
        $scope.dataLoading = false;
    });

    var setModelFilterData = function() {
         $scope.models = function(column) {
            var def = $q.defer(),
                arr = [],
                models = [];
            angular.forEach($scope.aircrafts, function(item){
                if (inArray(item.model, arr) === -1) {
                    arr.push(item.model);
                    models.push({
                        'id': item.model,
                        'title': item.model
                    });
                }
            });
            def.resolve(models);
            return def;
        };

        var inArray = Array.prototype.indexOf ?
        function (val, arr) {
            return arr.indexOf(val);
        } :
        function (val, arr) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === val) return i;
            }
            return -1;
        };   
    };

    $scope.regTypeChange = function() {
        $scope.showulvno = (Enums.REG_TYPE.ULV.value == $scope.aircraft.reg_type) ? true : false;
    };

    $scope.catSelChange = function(lsa_cat) {
        if (lsa_cat == "ULV") { 
            $scope.aTypes = $scope.enums.ulvTypes; 
            $scope.regLabel = "신고번호";
        }
        else { 
            $scope.aTypes = $scope.enums.lsaTypes; 
            $scope.regLabel = "등록부호";
        }
    };

    $scope.getLsaTypeString = function(lsa_type) {
        return Enums.AIRCRAFT_TYPE[lsa_type].slabel;
    }

    $scope.selchange = function() {
        console.log('selectedItem = ', $scope.aircraft._bld_asm);
    };

    $scope.hideDetail = function() {
        $scope.showdetail = false;
    };
    
    var getSubDocs = function(aircraft) {
       /* sub functions */
        var getComponentsSubDocs = function(aircraft) {
            aircraft.components.forEach(function(comp) {
                var prd_id = null;
                if (comp._product._id === undefined) 
                    prd_id = comp._product
                else
                    prd_id = comp._product._id;

                var product = _.find($scope.products, { _id: prd_id });
                if (!product)
                    console.log('product find error!');
                else {
                    comp._product = product;

                    var mfg_id = null;
                    if (product._manufacturer._id === undefined) 
                        mfg_id = product._manufacturer;
                    else
                        mfg_id = product._manufacturer._id;

                    var manufacturer = _.find($scope.manufacturers, { _id: mfg_id });
                    if (!manufacturer)
                        console.log('manufacturer find error!');
                    else 
                        comp._product._manufacturer = manufacturer;
                }
            });
        }

        var getBuilders = function(aircraft) {
            console.log('getBuilders aircraft._bld_asm: ', aircraft._bld_asm);
            if (aircraft._bld_asm._id === undefined) {
                aircraft._bld_asm = _.find($scope.builders, { _id: aircraft._bld_asm });
                aircraft._bld_kit = _.find($scope.builders, { _id: aircraft._bld_kit });
                aircraft._bld_dsn = _.find($scope.builders, { _id: aircraft._bld_dsn });
            }
        };

        var getOwner = function(aircraft) {
            if (aircraft._owner) {
                if (aircraft._owner._id === undefined) 
                    aircraft._owner = _.find($scope.owners, { _id: aircraft._owner });
                else 
                    aircraft._owner = _.find($scope.owners, { _id: aircraft._owner._id });
            }
        };

        getOwner(aircraft);
        getBuilders(aircraft);
        getComponentsSubDocs(aircraft);
    }
    
    $scope.showAircraft = function(aircraft) {
        $scope.aircraft = jQuery.extend(true, {}, aircraft);
        
        getSubDocs($scope.aircraft);

        if (!angular.isDefined($scope.aircraft._afiles))
            $scope.aircraft._afiles = [];
        if (!angular.isDefined($scope.aircraft._aimages))
            $scope.aircraft._aimages = [];
        $scope.afiles = $scope.aircraft._afiles;
        $scope.aimages = $scope.aircraft._aimages;

        $scope.catSelChange(aircraft.lsa_cat);
        $scope.showdetail = true;
        $scope.showcmd = 'mod';
    };

    /* addAircraft: temporory function */
    $scope.addAircraft = function(lsa_cat) {
        $scope.aircraft = {
            lsa_cat: lsa_cat, 
            lsa_type: 'AIRPLANE',
            _afiles: [],
            _aimages: []
        };
        $scope.afiles = $scope.aircraft._afiles;
        $scope.aimages = $scope.aircraft._aimages;
        $scope.catSelChange(lsa_cat);
        
        $scope.showcmd = 'add';
        $scope.showimage = false;
        $scope.showdetail = true;

        //test code...
        $scope.aircraft = {
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
        //

        $state.go('aircraft.detail');
    };
    
    $scope.$on('owner', function (event, data) {
        var event = data.event;
        var item = data.item;
        if (event == 'updated') {
            var afts = $filter('filter')($scope.aircrafts, { _owner: {_id: item._id }});
            afts.forEach(function(aircraft) {
                aircraft._owner = item;
            });
        }
    });

    /*
    $scope.$on('product', function (event, data) {
        var event = data.event;
        var item = data.item;
        if (event == 'updated') {
            $scope.aircrafts.forEach(function(aircraft) {
                aircraft.components.forEach(function(comp) {
                    if(comp._product._id === item._id) {
                        comp._product = item;
                    }
                });
            });
        }
    });

    $scope.$on('manufacturer', function (event, data) {
        var event = data.event;
        var item = data.item;
        if (event == 'updated') {
            var products = $filter('filter')($scope.products, { '_manufacturer._id': item._id });
            products.forEach(function(product) {
                product._manufacturer = item;
            });

            $scope.aircrafts.forEach(function(aircraft) {
                aircraft.components.forEach(function(comp) {
                    if(comp._product._manufacturer._id === item._id) {
                        comp._product._manufacturer = item;
                    }
                });
            });
        }
    });
    */
});