'use strict';

angular.module('insApp')
    .controller('CertificateCtrl', function ($scope, $http, $stateParams, $filter, $modal, $q, $state, $sce, socket, ApiService, Enums, dialogs) {
    $scope.certificate = null;
    $scope.certificateId = $stateParams.id;
    $scope.newCertificate = null;
    $scope.showdetail = false;
    $scope.enums = Enums;
    $scope.aTypes = null;
    $scope.dataLoading = true;
    $scope.results = [];
    $scope.models = null;

    $q.all([
        ApiService.async('manufacturer'), 
        ApiService.async('builder'),
        ApiService.async('product'), 
        ApiService.async('aircraft'),
        ApiService.async('inspection'),
        ApiService.async('certificate')
    ]).then(function(response) {
        angular.forEach(response, function(data) {
            $scope.results[data.type] = data.result;
        });

        $scope.manufacturers = $scope.results['manufacturer'];
        $scope.builders = $scope.results['builder'];
        $scope.products = $scope.results['product'];
        $scope.aircrafts = $scope.results['aircraft'];
        $scope.inspections =  $scope.results['inspection'];
        $scope.certificates =  $scope.results['certificate'];

        $scope.loadingError = null;
    }, function(err) {
        console.log('error', err);
        $scope.loadingError = err;
    }).finally(function () {
        $scope.dataLoading = false;
    });

    $scope.catSelChange = function(lsa_category) {
        if (lsa_category == "ULV") { 
            $scope.aTypes = $scope.enums.ulvTypes; 
            $scope.regLabel = "신고번호";
        }
        else { 
            $scope.aTypes = $scope.enums.lsaTypes; 
            $scope.regLabel = "등록부호";
        }
    };

    $scope.getCertStatus = function(certificate, cdate) {
        if(!certificate.valid) 
            return false;
        if (!cdate) // get current date
            cdate = (new Date()).toISOString().slice(0,10);
        if (cdate < certificate.date_start || cdate > certificate.date_end)
            return false;
        else
            return true;
    }

    $scope.getCertStatusString = function(certificate, cdate) {
        if(!certificate.valid) 
            return Enums.getInvalidTypeString(certificate.invalid_type);

        if (!cdate) // get current date
            cdate = (new Date()).toISOString().slice(0,10);
        if (cdate < certificate.date_start || cdate > certificate.date_end)
            return '만료';
        else
            return '정상';
    }

    var getAircraftSubDocs = function(aircraft) {
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

        if (aircraft) {
            getOwner(aircraft);
            getBuilders(aircraft);
            getComponentsSubDocs(aircraft);
        }
    }

    var getSubDocs = function(certificate) {
       /* sub functions */
        var getObjectFromId = function(obj, pname, array) {
            var item = null;
            if (!obj) 
                return;
            if (obj[pname] !== undefined && obj[pname]._id === undefined)
                item = _.find(array, { _id: obj[pname] });
            if (item)
                obj[pname] = item;
        }
        
        getObjectFromId(certificate, '_aircraft', $scope.aircrafts);
        getObjectFromId(certificate, '_inspection', $scope.inspections);
        getAircraftSubDocs(certificate._aircraft);
    }

   var setAFiles = function(obj) {
        if (!angular.isDefined(obj._afiles))
            obj._afiles = [];
        if (!angular.isDefined(obj._aimages))
            obj._aimages = [];
        $scope.afiles = obj._afiles;
        $scope.aimages = obj._aimages;    
   }

   $scope.showCertificate = function(certificate) {
        $scope.certificate = jQuery.extend(true, {}, certificate);
        getSubDocs($scope.certificate);
        setAFiles($scope.certificate);

        $scope.showdetail = true;
        $scope.showcmd = 'mod';
    };

    $scope.getLastCert = function(aircraftid, type, valid, date_pub, cert_no, cb) {
        var uri = '/api/certificates/last?' + 'aircraft=' + aircraftid + '&type=' + type;
        if (valid)
            uri += '&valid=' + valid;
        if (date_pub && date_pub != null)
            uri += '&date_pub=' + date_pub;
        if (cert_no && cert_no != null)
            uri += '&cert_no=' + cert_no;

        $http.get(uri)
        .then(function (res) {
            cb(null, res.data.lastcert);
        }, function (err) {
            console.log('getLastCert err: ', err);
            cb(err, null);
        });
    }

    var openCertAdd = function () {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'app/template/certAddModal.html',
            controller: 'CertAddDlgCtrl',
            resolve: {
                aircraft: null,
                ins_type: null
            }
        });

        modalInstance.result.then(function (result) {
            console.log('aircraft: ', result.aircraft, 'ins_type: ', result.ins_type, 'type: ', result.type, 'date_pub: ', result.date_pub);
            $scope.getLastCert(result.aircraft._id, result.type, false, null, null, function(err, lastcert) {
                console.log('lastcert: ', lastcert);
                // 기존에 대기중인 인증서가 있는 경우 신규 추가하지 않고 해당 인증서 수정 모드로 이동한다
                if (lastcert && lastcert.invalid_type == 'WAIT') {
                    dialogs.notify('인증서 대기중', '작성 후 대기중인 인증서가 있습니다.<br/>해당 인증서 수정 페이지로이동합니다');
                    $scope.showCertificate(lastcert);
                }
                else {
                    $scope.certificate = {
                        type: result.type,
                        valid: false,
                        invalid_type: 'WAIT',
                        _aircraft: result.aircraft,
                        ins_type: result.ins_type,
                        date_pub: result.date_pub,
                        date_start: result.date_pub
                    };
                    getSubDocs($scope.certificate);
                    setAFiles($scope.certificate);
                    
                    $scope.showcmd = 'add';
                    $scope.showimage = false;
                    $scope.showdetail = true;
                }

                $state.go('certificate.detail');
            });
        }, function () {
            console.info('Modal dismissed at: ' + new Date());
        });
    };

    /* addAircraft: temporory function */
    $scope.addCertificate = function(aircraft, inspection, ins_type) {
        openCertAdd();
    };
});