'use strict';

angular.module('insApp')
    .controller('AircraftDetailCtrl', function ($scope, $http, $state, $stateParams, $filter, $modal, $q, socket, Enums, dialogs, ApiService) {
        if (!$scope.showdetail)
            $state.go('aircraft.list');
        
        if ($scope.aircraft != null && $scope.aircraft._id != null)
            $scope.txtSubmit = "수정";
        else
            $scope.txtSubmit = "추가";
            
        console.log('AircraftDetailCtrl aircraft: ', $scope.aircraft);

        //$scope.isCollapsed = false;

        // start of carousel
        $scope.carouselInterval = 5000;
        // end of carousel

        $scope.ptnRegNo = "/^(HLC|HL-C)[\d]{3}$/";    
        $scope.regNoChange = function(reg_no) {
            console.info('reg_no: ', reg_no);
            $scope.regexist = false;
            if ($scope.aircraft.reg_no) {
                $scope.aircraft.reg_no = $scope.aircraft.reg_no.toUpperCase().replace("HLC", "HL-C");
            }
        }

        $scope.regCheckAsync = function(value) {
            return $q(function(resolve, reject) {
                if ($scope.showcmd !=='add' || !value) return resolve();
                var regNo = value.toUpperCase().replace("HL-C", "HLC");
                ApiService.list('aircraft', {search : {reg_no: regNo}}).then(function (results) {
                    if (results.data.count > 0) 
                        reject();
                    else
                        resolve();
                }, function (err) {
                    resolve();
                });     
            });
        }
  
        $scope.getInstalledString = function (status) {
            return status ? "장착" : "탈착";
        }

        $scope.getCompTypeString = function (compType) {
            return $scope.enums.COMP_TYPE[compType].label;
        }

        $scope.regionChange = function () {
            $scope.aircraft.acenter = $scope.enums.REGION[$scope.aircraft.region].acenter;
        }

        $scope.compStatusChange = function (cmd, component) {
            switch (cmd) {
                case 'del':
                    var dlg = dialogs.confirm('확인', '선택한 부품을 제거하시겠습니까?');
                    dlg.result.then(function (btn) {
                        var index = $scope.aircraft.components.indexOf(component);
                        console.log('index:', index);
                        if (index > -1) {
                            $scope.aircraft.components.splice(index, 1);
                        }
                    });
                    break;
                case 'install':
                    var dlg = dialogs.confirm('확인', '선택한 부품을 항공기에(서) ' + $scope.getInstalledString(!component.installed) + '하시겠습니까?');
                    dlg.result.then(function (btn) {
                        component.installed = !component.installed;
                    });
                    break;
                case 'add':
                    open(cmd, null);
                    break;
                case 'mod':
                    open(cmd, component);
                    break;
            }
        }

        var open = function (cmd, component) {
            $scope.component = component;
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'app/template/componentModal.html',
                controller: 'ComponentDlgCtrl',
                resolve: {
                    aircraft: function () { return $scope.aircraft; },
                    products: function () { return $scope.products; },
                    component: function () { return $scope.component; },
                    manufacturers: function () { return $scope.manufacturers; },
                    cmd: function () { return cmd; }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
                console.info('Modal dismissed at: ' + new Date());
            });
        }

        $scope.getRequiredCompTypesStr = function(lsa_type) {
            var str = "";
            if (!$scope.requiredCompTypes) return str;
            $scope.requiredCompTypes.forEach(function(item) {
                str += Enums.COMP_TYPE[item].label + ', ';
            });
            return str.substring(0, str.length - 2);
        }

        var isPopulated = function(obj) {
            if (obj !== undefined && obj._id !== undefined)
                return true;
            else 
                return false;
        }
        
        var updateBuilderInAircraft = function (cmd, aircraft, builder) {
            if (aircraft == null || builder == null) return;

            var new_builder = null;
            if (cmd === 'mod' || cmd === 'updated')
                new_builder = builder;

            if (aircraft._bld_asm && aircraft._bld_asm._id == builder._id)
                aircraft._bld_asm = new_builder;
            if (aircraft._bld_kit && aircraft._bld_kit._id == builder._id)
                aircraft._bld_kit = new_builder;
            if (aircraft._bld_dsn && aircraft._bld_dsn._id == builder._id)
                aircraft._bld_dsn = new_builder;
        }

        $scope.builderChange = function (cmd, builder, type) {
            console.log('cmd', cmd, 'builder', builder,'type', type);
            var openBuilder = function (cmd, builder, type) {
                $scope.builder = builder;
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'app/template/builderModal.html',
                    controller: 'BuilderDlgCtrl',
                    resolve: {
                        builder: function () { return $scope.builder },
                        builders: function () { return $scope.builders; },
                        cmd: function () { return cmd; },
                        type: function () { return type; }
                    }
                });

                modalInstance.result.then(function (builder) {
                    console.info('builder modal closed:', builder, 'type', type);
                    switch(type) {
                    case 'BLD_ASM':
                        $scope.aircraft._bld_asm = builder;
                        break;
                    case 'BLD_KIT':
                        $scope.aircraft._bld_kit = builder;
                        break;
                    case 'BLD_DSN':
                        $scope.aircraft._bld_dsn = builder;
                        break;
                    }
                }, function () {
                    console.info('Modal dismissed at: ' + new Date());
                });
            };

            switch (cmd) {
                case 'del':
                    var dlg = dialogs.confirm('확인', '선택한 제작자를 제거하시겠습니까?');
                    dlg.result.then(function (btn) {
                        if (builder.name === '00.Unknown') {
                            dialogs.notify('알림', builder.name + '은 삭제할 수 없습니다.');
                        }
                        else {
                            ApiService.delete('builder', builder._id).then(function (results) {
                                var index = $scope.builders.indexOf(builder);
                                if (index > -1)
                                    $scope.builders.splice(index, 1);

                                updateBuilderInAircraft(cmd, $scope.aircraft, builder);
                                dialogs.notify('알림', builder.name + '(이)가 성공적으로 삭제 되었습니다.');
                            }, function (err) {
                                console.log('then err called, err: ', err);
                                dialogs.error('오류', builder.name + '(이)가 다른 항공기에 설정되어 있거나, 삭제중 오류가 발생했습니다.');
                            }); 
                        }
                    });
                    break;
                case 'add':
                    openBuilder(cmd, null, type);
                    break;
                case 'mod':
                    openBuilder(cmd, builder, type);
                    break;
            }
        }

        $scope.ownerChange = function (cmd, owner) {
            console.log('cmd', cmd, 'owner', owner);
            var updateOwnerInAircraft = function (cmd, aircraft, owner) {
                if (aircraft == null || owner == null) return;

                var new_owner = null;
                if (cmd === 'mod' || cmd === 'updated')
                    new_owner = owner;

                if (aircraft._owner && aircraft._owner._id == owner._id)
                    aircraft._owner = new_owner;
            }

            var openOwner = function (cmd, owner) {
                $scope.owner = owner;
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'app/template/ownerModal.html',
                    controller: 'OwnerDlgCtrl',
                    resolve: {
                        owner: function () { return $scope.owner },
                        owners: function () { return $scope.owners; },
                        cmd: function () { return cmd; }
                    }
                });

                modalInstance.result.then(function (owner) {
                    console.info('owner modal closed:', owner);
                    $scope.aircraft._owner = owner;
                }, function () {
                    console.info('Modal dismissed at: ' + new Date());
                });
            };
            
            switch (cmd) {
                case 'del':
                    var dlg = dialogs.confirm('확인', '선택한 소유자를 제거하시겠습니까?');
                    dlg.result.then(function (btn) {
                        if (owner.name === '00.Unknown') {
                            dialogs.notify('알림', owner.name + '은 삭제할 수 없습니다.');
                        }
                        else {
                            ApiService.delete('owner', owner._id).then(function (results) {
                                var index = $scope.owners.indexOf(owner);
                                if (index > -1)
                                    $scope.owners.splice(index, 1);

                                updateOwnerInAircraft(cmd, $scope.aircraft, owner);
                                dialogs.notify('알림', owner.name + '(이)가 성공적으로 삭제 되었습니다.');
                            }, function (err) {
                                console.log('then err called, err: ', err);
                                dialogs.error('오류', owner.name + '(이)가 다른 항공기에 설정되어 있거나, 삭제중 오류가 발생했습니다.');
                            }); 
                        }
                    });
                    break;
                case 'add':
                    openOwner(cmd, null);
                    break;
                case 'mod':
                    openOwner(cmd, owner);
                    break;
            }
        }

        $scope.getUniqueModels = function(lsa_type){
           var u = {}; 
           $scope.aircraftModels = [];

           if (!lsa_type) return;
           for(var i = 0, l = $scope.aircrafts.length; i < l; i++){
                var aircraft = $scope.aircrafts[i];

                var bld_asm, bld_kit, bld_dsn = null;
                if (isPopulated(aircraft._bld_asm)) {
                    bld_asm = aircraft._bld_asm;
                    bld_kit = aircraft._bld_kit;
                    bld_dsn = aircraft._bld_dsn;
                }
                else {
                    bld_asm = _.find($scope.builders, { _id: aircraft._bld_asm });
                    bld_kit = _.find($scope.builders, { _id: aircraft._bld_kit });
                    bld_dsn = _.find($scope.builders, { _id: aircraft._bld_dsn });
                }
                
                if (bld_asm == null)
                    continue;

                var desc = aircraft.model.toUpperCase() +' by ' + bld_asm.name.toUpperCase();
                if(aircraft.lsa_type != lsa_type || !aircraft.model || u.hasOwnProperty(desc)) { 
                    continue; 
                }
                $scope.aircraftModels.push({model: aircraft.model, 
                                            desc: desc,
                                            _bld_asm: bld_asm, 
                                            _bld_kit: bld_kit, 
                                            _bld_dsn: bld_dsn});
                u[desc] = 1;
           }
           return $scope.aircraftModels;
        }

        //$scope.aircraftModels = $scope.getUniqueModels($scope.aircraft.lsa_type);
        $scope.selectModel = function (item, model, label) {
            $scope.aircraft._bld_asm = item._bld_asm;
            $scope.aircraft._bld_kit = item._bld_kit;
            $scope.aircraft._bld_dsn = item._bld_dsn;
        }
    
        var deleteNewFiles = function(aircraft) {
            var newafiles = _.pluck(_.filter(aircraft._afiles, { 'isnew': true }), '_id');
            newafiles = newafiles.concat(_.pluck(_.filter(aircraft._aimages, { 'isnew': true }), '_id'));
            newafiles.forEach(function (id) {
                ApiService.delete('afile', id);
            });
        }
        
        $scope.dataLoading = false;
        $scope.updateAircraft = function(aircraft) {
            aircraft.reg_no = aircraft.reg_no.replace("HL-C", "HLC");
            $scope.dataLoading = true;
            $scope.saving = true;
            $scope.updating = true;

            if ($scope.showcmd === 'add') {
                ApiService.add('aircraft', aircraft)
                    .then(function (results) {
                        dialogs.notify('Notification', aircraft.reg_no.replace("HLC", "HL-C") + ' created successfully.');
                    }, function (err) {
                        console.log('then err called, err: ', err);
                        dialogs.error('Error', err);
                    }).finally(function () {
                        $scope.dataLoading = false;
                        $scope.saving = false;
                    });    
            }
            else {
                ApiService.update('aircraft', aircraft)
                    .then(function (results) {
                        dialogs.notify('Notification', aircraft.reg_no.replace("HLC", "HL-C") + ' updated successfully.');
                    }, function (err) {
                        console.log('then err called, err: ', err);
                        dialogs.error('Error', err);
                    }).finally(function () {
                        $scope.dataLoading = false;
                        $scope.saving = false;
                    });    
            }
            
        };
    
        $scope.deleteAircraft = function(aircraft) {
            var dlg = dialogs.confirm('Confirmation', 'Delete ' + aircraft.reg_no.replace("HLC", "HL-C") + '?');
            dlg.result.then(function (btn) {
                // delete newly attached files (these files are not included in aircraft DB)
                deleteNewFiles(aircraft);

                ApiService.delete('aircraft', aircraft._id)
                    .then(function (results) {
                        dialogs.notify('Notification', aircraft.reg_no + ' deleted successfully.');
                        _.remove($scope.aircrafts, { _id: aircraft._id });
                        $state.go('aircraft.list');
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

        $scope.$watch('aircraft.lsa_type', function() {
            if (!$scope.aircraft || !$scope.aircraft.lsa_type || !$scope.showdetail) return;
            $scope.requiredCompTypes = Enums.getRequiredCompTypes($scope.aircraft.lsa_type);
            $scope.installableCompTypes = Enums.getInstallableCompTypes($scope.aircraft.lsa_type);
            $scope.aircraftModels = $scope.getUniqueModels($scope.aircraft.lsa_type);
        });

        $scope.$on('aircraft', function (event, data) {
            var event = data.event;
            var item = data.item;

            console.log('on aircraft: event, data', event, data);

            if (event == 'updated') {
                if (item._id == $scope.aircraft._id && item.event_no != $scope.aircraft.event_no) {
                    $scope.aircraft = jQuery.extend(true, {}, item);
                    $scope.afiles = $scope.aircraft._afiles;
                    $scope.aimages = $scope.aircraft._aimages;
                }
            }
            else if (event == 'deleted') {
                if (item._id == $scope.aircraft._id) {
                    $scope.aircraft = null;
                    $scope.showdetail = false;
                    $state.go('aircraft.list');
                }
            }
        });

        $scope.$on('builder', function (event, data) {
            updateBuilderInAircraft(data.event, $scope.aircraft, data.item);
        });

        $scope.$on('owner', function (event, data) {
            var event = data.event;
            var item = data.item;
            if (event == 'updated') {
                if (item._id == $scope.aircraft._owner._id)
                    $scope.aircraft._owner = item;
            }
            else if (event == 'removed') {
            if (item._id == $scope.aircraft._owner._id)
                $scope.aircraft._owner = null;    
            }
        });

        $scope.$on('product', function (event, data) {
            var event = data.event;
            var item = data.item;
            if (event == 'updated') {
                $scope.aircraft.components.forEach(function(comp) {
                    if(comp._product._id === item._id) {
                        comp._product = item;
                    }
                });
            }
        });

        $scope.$on('manufacturer', function (event, data) {
            var event = data.event;
            var item = data.item;
            if (event == 'updated') {
                $scope.aircraft.components.forEach(function(comp) {
                    if(comp._product._manufacturer._id === item._id) {
                         comp._product._manufacturer = item;
                    }
                });
            }
        });

        $scope.$on('certificate', function (event, data) {
            var event = data.event;
            var item = data.item;
            var array = $scope.aircraft._certificates;
            switch(event) {
                case 'created':
                    if ($scope.aircraft._id == item._aircraft._id) {
                        var oldItem = _.find(array, { _id: item._id });
                        if (oldItem) {
                            var index = array.indexOf(oldItem);
                            array.splice(index, 1, item);
                        }
                        else 
                            array.push(item);
                    }
                    break;
                case 'updated':
                    var oldItem = _.find(array, { _id: item._id });
                    if (oldItem) {
                        var index = array.indexOf(oldItem);
                        array.splice(index, 1, item);
                    }
                    break;
                case 'removed':
                    _.remove(array, { _id: item._id });
                    break;
            }
        });
    });