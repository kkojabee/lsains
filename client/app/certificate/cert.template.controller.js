'use strict';

angular.module('insApp')
    .controller('CertTemplateCtrl', function ($scope, $http, $state, $stateParams, $filter, $modal, $q, $sce, socket, Enums, dialogs, ApiService) {
        if ($scope.certificate != null && $scope.certificate._id != null)
            $scope.txtSubmit = "수정";
        else
            $scope.txtSubmit = "추가";

        console.log('$scope.certificate: ', $scope.certificate);

        $scope.dateCheck = function(sdate) {
            if (!sdate)
                return false;
            var dd = new Date(sdate);
            return (!dd || isNaN(dd.getTime())) ? false : true;
        }

        $scope.rateChange = function() {
            if (!$scope.certificate.rate || $scope.certificate.rate.length < 1) {
                $scope.certificate.limit = null;
            }
            else 
                $scope.certificate.limit = Enums.getRateLimitString($scope.certificate.rate);
        }

        $scope.getNextCertNo = function() {
            var type = $scope.certificate.type;
            var lsa_category = $scope.aircraft.lsa_category;

            $http.get('/api/certificates/next?' + 'lsa_category=' + lsa_category + '&type=' + type)
            .then(function (res) {
                $scope.certificate.cert_no = res.data.cert_no;
            }, function (err) {
                console.log('getNextCertNo err: ', err);
            });
        }

        var updateCertValidityFromPubDate = function (certificate, date_pub) {
            if (!certificate || !date_pub)
                return;

            if ($scope.lastcert.date_end < date_pub) {
                $scope.lastcert.valid = false;
                $scope.lastcert.invalid_type = 'EXPIRE';
            }
            else {
                $scope.lastcert.valid = true;
                $scope.lastcert.invalid_type = null;
            }
        }

        $scope.calcNextCertDueDate = function() {
            if ($scope.certificate.type == 'RGL')
                $scope.certificate.date_end = calcNextRglCertDueDate();
            else
                $scope.certificate.date_end = calcNextTmpCertDueDate();
        }

        $scope.dateChange = function() {
            $scope.calcNextCertDueDate();
        }

        // 임시인증서의 경우 교부일자가 아닌 사용자가 지정한 시작일을 기준으로 만료일을 계산한다
        var calcNextTmpCertDueDate = function() {
            var aircraft = $scope.aircraft;
            var lastcert = $scope.lastcert;
            var type = $scope.certificate.type;
            var date_start = $scope.certificate.date_start;
            var date_pub = $scope.certificate.date_pub;
            var ins_type = $scope.certificate.ins_type;
            var cer = $scope.certificate;
            var dstart =  new Date(date_start);
            var dend = null;

            if (!$scope.dateCheck(dstart))
                return;

            // test code
            if (!ins_type)
                ins_type = 'SCH';
            
            // 인증서 교부일자가 없거나 시작일보다 빠를 경우 교부일을 시작일로 변경한다
            if (!date_pub || cer.date_pub > cer.date_start) {
                cer.date_pub = cer.date_start;
            }

            var nd = (ins_type == 'INI' && !$scope.lastcert) ? 29 : 9;
            dend = dstart;
            dend.setDate(dend.getDate() + nd);
            return dend.toISOString().slice(0,10);
        }

        var calcNextRglCertDueDate = function() {
            var aircraft = $scope.aircraft;
            var lastcert = $scope.lastcert;
            var type = $scope.certificate.type;
            var date_pub = $scope.certificate.date_pub;
            var ins_type = $scope.certificate.ins_type;
            var cer = $scope.certificate;
            var dpub = new Date(date_pub);
            var dstart = null;
            var dend = null;

            if (!dpub || isNaN(dpub.getTime()) || !date_pub)
                return;

            // test code
            if (!ins_type)
                ins_type = 'SCH';

            // 인증서 시작일자가 없거나 교부일보다 빠를 경우 시작일을 교부일로 변경한다
            if (!cer.date_start || date_pub >= cer.date_start) {
                cer.date_start = date_pub;
                dstart = new Date(cer.date_start);
            }

            // 기존에 발행된 인증서의 유효여부 업데이트
            updateCertValidityFromPubDate(lastcert, date_pub);

            //인증서
            var ny = (aircraft.lsa_category == 'ULV' && !aircraft.profit) ? 2 : 1;
            switch(ins_type) {
                case 'INI': 
                case 'REI':
                    dend = $scope.getNextYearM1(dpub, ny);
                    break;
                case 'ONT':
                case 'REP':
                    dend = new Date(lastcert.date_end);
                    break;
                case 'SCH':
                    if (!lastcert || !lastcert.valid) {
                        console.log('!lastcert || !lastcert.valid');
                        dend = $scope.getNextYearM1(dpub, ny);
                    }
                    else {
                        var dend_last = new Date(lastcert.date_end); 
                        console.log('dend_last: ', dend_last);
                        if (dend_last || isNaN(dend_last.getTime())) {
                            var dp30 = new Date(dpub);
                            dp30.setDate(dp30.getDate() + 30);
                            if (dend_last <= dp30) {  // 기존 인증서 만료일이 교부일에서 30일 이내인경우 기존 만료일 기준
                                dend = dend_last;
                                dend.setFullYear(dend.getFullYear() + ny);
                            }
                            else {    // 기존 인증서 만료일이 교부일에서 30일 초과인 경우 교부일 기준
                                dend = $scope.getNextYearM1(dpub, ny);
                            }
                        }
                        else {
                            dend = $scope.getNextYearM1(dpub, ny);
                        }
                    }   
                    break;
            }

            if (!dend || isNaN(dend.getTime()))
                return null;
            else
                return dend.toISOString().slice(0,10);

        }

        $scope.getCertNumPattern = function() {
            var pattern;
            var cert = $scope.certificate;
            var lsa_category = $scope.aircraft.lsa_category

            if (cert.type == 'RGL' && lsa_category == 'LSA') 
                pattern = /^KL[\d]{2}\-[\d]{3}$/i;
            else if (cert.type == 'TMP' && lsa_category == 'LSA') 
                pattern = /^TL[\d]{2}\-[\d]{3}$/i;
            else if (cert.type == 'RGL' && lsa_category == 'ULV') 
                pattern = /^KQ[\d]{2}\-[\d]{3}$/i;
            else if (cert.type == 'TMP' && lsa_category == 'ULV') 
                pattern = /^TQ[\d]{2}\\-[\d]{3}$/i;

            console.log('pattern: ', pattern);

            return pattern;
        }

        $scope.getCertTitle = function() {
            var certTitle = '안전성인증서';
            var catString = Enums.getLsaCatString($scope.aircraft.lsa_category);
            return catString + ' ' + certTitle + (($scope.certificate.type == 'TMP') ? '(임시)' : '');
        }

        $scope.getAircraftTypeString = function() {
            if ($scope.aircraft.lsa_category == 'LSA')
                return Enums.getLsaTypeString($scope.aircraft.lsa_type);
            else        
                return Enums.getUlvTypeString($scope.aircraft.lsa_type);
        }

        $scope.getEgModel = function() {
            var egModel = null;
            
            for (var i in $scope.aircraft.components) {
                var comp = $scope.aircraft.components[i];
                if(comp.installed && comp._product.comp_type == 'ENGINE') {
                    egModel = comp._product.model_name;
                    break;
                }
            }
            return egModel;
        }        

        $scope.getNextYearM1 = function(oneDate, nY) {
            var newDate = oneDate;
            if (!newDate)
                newDate = new Date();
            if (!nY)
                nY = 1;
            newDate.setFullYear(newDate.getFullYear() + nY);
            newDate.setDate(newDate.getDate() - 1);
            return newDate;
        }
        
        $scope.checkAircraft = function(regNo) {
            var aircraft = _.find($scope.aircrafts, {reg_no: regNo});
            if (aircraft)
                return true
            else
                return false;
        }

        $scope.certNoCheckAsync = function(value) {
            return $q(function(resolve, reject) {
                if ($scope.showcmd !=='add' || !value) return resolve();
                var cert_no = value.toUpperCase();
                ApiService.list('certificate', {search :  { cert_no: cert_no }}).then(function (results) {
                    if (results.data.count > 0) 
                        reject();
                    else
                        resolve();
                }, function (err) {
                    resolve();
                });     
            });
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

        var init = function() {
            var cert = $scope.certificate;
            $scope.aircraft = cert._aircraft;
            $scope.file_type = 'CER';
            $scope.catSelChange($scope.aircraft.lsa_category);                
            $scope.today = (new Date()).toISOString().slice(0,10);
            $scope.nextYM1 = ($scope.getNextYearM1(new Date())).toISOString().slice(0,10);

            $scope.getLastCert($scope.aircraft._id, cert.type, true, null, cert.cert_no, function (err, lastcert) {

                console.log('lastcert: ', lastcert);

                if (lastcert && $scope.certificate._id != lastcert._id)
                    $scope.lastcert = lastcert;    
                
                if($scope.showcmd == 'add') {
                    $scope.getNextCertNo();
                    $scope.calcNextCertDueDate();   // 차기 인증 유효일 업데이트
                    cert.eg_model = $scope.getEgModel();
                    cert.rate = (!lastcert) ? lastcert.rate : null;
                    cert.limit = (!lastcert) ? lastcert.limit : null;
                    console.log('$scope.certificate.eg_model: ', $scope.certificate.eg_model);
                }
            });
        }

        init();

        $scope.dataLoading = false;
        $scope.updateCertificate = function(certificate) {
            $scope.dataLoading = true;
            $scope.saving = true;
            $scope.updating = true;

            if ($scope.showcmd === 'add') {
                ApiService.add('certificate', certificate)
                    .then(function (results) {
                        dialogs.notify('Notification', certificate.cert_no + ' created successfully.');
                    }, function (err) {
                        console.log('then err called, err: ', err);
                        dialogs.error('Error', err);
                    }).finally(function () {
                        $scope.dataLoading = false;
                        $scope.saving = false;
                    });    
            }
            else {
                ApiService.update('certificate', certificate)
                    .then(function (results) {
                        dialogs.notify('Notification', certificate.cert_no + ' updated successfully.');
                    }, function (err) {
                        console.log('then err called, err: ', err);
                        dialogs.error('Error', err);
                    }).finally(function () {
                        $scope.dataLoading = false;
                        $scope.saving = false;
                    });    
            }
        };
    
        $scope.deleteCertificate = function(certificate) {
            var dlg = dialogs.confirm('Confirmation', certificate.cert_no + '를 삭제하시겠습니까?');
            dlg.result.then(function (btn) {
                // delete newly attached files (these files are not included in certificate DB)
                deleteNewFiles(certificate);

                ApiService.delete('certificate', certificate._id)
                    .then(function (results) {
                        dialogs.notify('Notification', certificate.cert_no + ' deleted successfully.');
                        _.remove($scope.certificates, { _id: certificate._id });
                        $state.go('certificate.list');
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

        $scope.$on('certificate', function (event, data) {
            var event = data.event;
            var item = data.item;

            console.log('on certificate: event, data', event, data);

            if (event == 'updated') {
                if (item._id == $scope.certificate._id && item.event_no != $scope.certificate.event_no) {
                    $scope.certificate = jQuery.extend(true, {}, item);
                    $scope.afiles = $scope.certificate._afiles;
                    $scope.aimages = $scope.certificate._aimages;
                }
            }
            else if (event == 'deleted') {
                if (item._id == $scope.certificate._id) {
                    $scope.certificate = null;
                    $scope.showdetail = false;
                    $state.go('certificate.list');
                }
            }
        });

        var checkEventSingle = function (obj, pname, data) {
            var event = data.event;
            var item = data.item;
            if (!obj[pname])
                return;
            if (event == 'updated') {
                if (obj[pname]._id == item._id)
                    obj[pname] = item;
            }
            else if (event == 'deleted') {
                if (obj[pname]._id == item._id)
                    obj[pname] = null;
            }
        }

        $scope.$on('aircraft', function (event, data) {
            checkEventSingle($scope.certificate, '_aircraft', data);
        });

        $scope.$on('inspection', function (event, data) {
            checkEventSingle($scope.certificate, '_inspection', data);
        });
    });