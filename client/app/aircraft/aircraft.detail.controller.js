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
                templateUrl: 'componentModal.html',
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
        
        $scope.builderChange = function (cmd, builder, type) {
            console.log('cmd', cmd, 'builder', builder,'type', type);
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

        var openBuilder = function (cmd, builder, type) {
            $scope.builder = builder;
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'builderModal.html',
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
    })
    .controller('ComponentDlgCtrl', function ($scope, $filter, $modal, $modalInstance, dialogs, ApiService, Enums, aircraft, products, manufacturers, component, cmd) {
        $scope.aircraft = aircraft;
        $scope.products = products;
        $scope.manufacturers = manufacturers;
        $scope.products_f;
        $scope.cmd = cmd;

        var getInstallableCompTypes = function () {
            var enumArray = [];
            if (!$scope.aircraft || !$scope.aircraft.lsa_type) return;

            var skipCompType = function (compType) {
                var skip = false;
                if (!$scope.aircraft.components) return skip;

                switch(compType) {
                    // AIRFRAME은 기체에서 유일함 
                    case 'AIRFRAME':
                        skip = $scope.aircraft.components.some(function (comp, index, array) {
                            return comp._product.comp_type === 'AIRFRAME';
                        });
                        break;
                    // 경량항공기는 단발엔진만 가능하며 하나만 장착 가능
                    case 'ENGINE':
                        skip = $scope.aircraft.components.some(function (comp, index, array) {
                            return $scope.aircraft.lsa_category === 'LSA' && comp._product.comp_type === 'ENGINE' && comp.installed;
                        });
                        break;
                }
                return skip;
            }

            Enums.getInstallableCompTypes($scope.aircraft.lsa_type).forEach(function(item) {
                if (!skipCompType(item))
                    enumArray.push({ label: Enums.COMP_TYPE[item].label, value: item });
            });
            return enumArray;
        }

        if ($scope.cmd === 'mod') {
            $scope.component = component;
            $scope.component.installed = $scope.component.installed.toString();
            $scope.comp_type = $scope.component._product.comp_type;
            $scope.product = $scope.component._product;
            $scope.products_f = $scope.products;
            $scope.product = ($filter('filter')($scope.products, { _id: $scope.component._product._id }))[0];
            $scope.comptypes = Enums.compTypes;
            console.log('$scope.product', $scope.product);
        }
        else {
            $scope.comp_type = null;
            $scope.product = null;
            $scope.component = { installed: "true" };
            $scope.comptypes = getInstallableCompTypes();
        }

        $scope.compTypeChange = function (comp_type) {
            if ($scope.cmd === 'mod') return;

            $scope.product = null;
            if (!comp_type) return;
            $scope.products_f = $filter('filter')($scope.products, { comp_type: comp_type });
        };

        $scope.pname = function (product) {
            return product.model + product.sub_model + product.revision + '(' + product._manufacturer.name + ')';
        };

        var openProduct = function (cmd, product, comp_type) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'ProductModal.html',
                controller: 'ProductDlgCtrl',
                resolve: {
                    comp_type:  function () { return $scope.comp_type },
                    product: function () { return $scope.product },
                    products: function () { return $scope.products; },
                    manufacturers: function () { return $scope.manufacturers; },
                    cmd: function () { return cmd; }
                }
            });

            modalInstance.result.then(function (product) {
                console.info('product modal closed:', product);

                var oldItem = _.find($scope.products, { _id: product._id });
                var index = $scope.products.indexOf(oldItem);
                if (oldItem) {
                    $scope.products.splice(index, 1, product);
                    $scope.component._product = $scope.product = product;
                } else {
                    $scope.products.push(product);
                }
                $scope.products_f = $filter('filter')($scope.products, { comp_type: comp_type });

            }, function () {
                console.info('Modal dismissed at: ' + new Date());
            });
        }

        $scope.productChange = function (cmd, product, comp_type) {
            console.log('cmd', cmd, 'product', product);
            switch (cmd) {
                case 'del':
                    var dlg = dialogs.confirm('확인', '선택한 부품형식을 제거하시겠습니까?<br/><small>*다른 부품에 사용중인 경우 삭제할 수 없습니다.</small>');
                    dlg.result.then(function (btn) {
                        ApiService.delete('product', product._id).then(function (results) {
                            var index = $scope.products.indexOf(product);
                            if (index > -1)
                                $scope.products.splice(index, 1);
                            dialogs.notify('알림', product.full_name + '(이)가 성공적으로 삭제 되었습니다.');
                        }, function (err) {
                            console.log('then err called, err: ', err);
                            dialogs.error('오류', product.full_name + '(이)가 다른 부품에 설정되어 있거나, 삭제중 오류가 발생했습니다.');
                        }); 
                    });
                    break;
                case 'add':
                    openProduct(cmd, null, comp_type);
                    break;
                case 'mod':
                    openProduct(cmd, product, comp_type);
                    break;
            }
        }

        $scope.save = function () {
            $scope.component._product = $scope.product;
            $scope.component.installed = ($scope.component.installed === 'true');
            if ($scope.cmd === 'add') {
                console.log('$scope.product', $scope.product);
                console.log('$scope.component', $scope.component);
                console.log('$scope.aircraft.components', $scope.aircraft.components);
                $scope.aircraft.components.push($scope.component);
            }

            $modalInstance.close($scope.component);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .controller('ProductDlgCtrl', function ($scope, $filter, $modal, $modalInstance, dialogs, ApiService, Enums, comp_type, product, products, manufacturers, cmd ){
        $scope.cmd = cmd;
        $scope.products = products;
        $scope.manufacturers = manufacturers;
        $scope.comptypes = Enums.compTypes;
        
        if ($scope.cmd === 'mod') {
            $scope.comptypes = Enums.compTypes;
            $scope.product = _.find(products, { _id: product._id });
            console.log('ProductDlgCtrl product: ', $scope.product);
        }
        else {
            $scope.product = {  
                comp_type: comp_type,
                _afiles: [],
                _aimages: []
            };
        }
        $scope.afiles = $scope.product._afiles;
        $scope.aimages = $scope.product._aimages;

        $scope.getModelName = function () {
            var product = $scope.product;
            return product.model +
                    (product.sub_model ? ' ' + product.sub_model : '') +
                    (product.revision ? ' ' + product.revision : '');
        }

        var postProduct = function (cmd, product) {
            var pb = null;
            var noti = (cmd === 'add') ? '추가' : '수정';

            console.log('postProdcut: cmd, product', cmd, product);

            if (cmd === 'add') 
                pb = ApiService.add('product', product);
            else 
                pb = ApiService.update('product', product);

            if (pb) {
                pb.then(function (results) {
                    console.log('then called, results: ', results);
                    $scope.product = results.data;
                    dialogs.notify('알림', $scope.product.full_name + '(이)가 성공적으로 ' + noti + '되었습니다.');
                }, function (err) {
                    console.log('then err called, err: ', err);
                    dialogs.error('오류', '제품 ' + noti + '중 오류가 발생했습니다.');
                }).finally(function () {
                    $scope.saving = false;
                    $modalInstance.close($scope.product);
                });    
            }
            else {
                dialogs.error('오류', '제품 ' + noti + '중 오류가 발생했습니다.');
                $scope.saving = false;
            }
        }

        var openManufacturer = function (cmd, manufacturer) {
            $scope.manufacturer = manufacturer;
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'manufacturerModal.html',
                controller: 'MfgDlgCtrl',
                resolve: {
                    manufacturer: function () { return $scope.product._manufacturer },
                    manufacturers: function () { return $scope.manufacturers; },
                    cmd: function () { return cmd; }
                }
            });

            modalInstance.result.then(function (manufacturer) {
                console.info('manufacturer modal closed:', manufacturer);
                $scope.product._manufacturer = manufacturer;
            }, function () {
                console.info('Modal dismissed at: ' + new Date());
            });
        }

        $scope.mfgChange = function (cmd, manufacturer) {
            console.log('cmd', cmd, 'manufacturer', manufacturer);
            switch (cmd) {
                case 'del':
                    var dlg = dialogs.confirm('확인', '선택한 제작자를 제거하시겠습니까?<br/><small>*부품형식에 설정된 상태에서는 삭제할 수 없습니다.</small>');
                    dlg.result.then(function (btn) {
                        if (manufacturer.name === '00.Unknown') {
                            dialogs.notify('알림', manufacturer.name + '은 삭제할 수 없습니다.');
                        }
                        else {
                            ApiService.delete('manufacturer', manufacturer._id).then(function (results) {
                                var index = $scope.manufacturers.indexOf(manufacturer);
                                if (index > -1)
                                    $scope.manufacturers.splice(index, 1);
                                dialogs.notify('알림', manufacturer.name + '(이)가 성공적으로 삭제 되었습니다.');
                            }, function (err) {
                                console.log('then err called, err: ', err);
                                dialogs.error('오류', manufacturer.name + '(이)가 다른 부품형식에 설정되어 있거나, 삭제중 오류가 발생했습니다.');
                            }); 
                        }
                    });
                    break;
                case 'add':
                    openManufacturer(cmd, null);
                    break;
                case 'mod':
                    openManufacturer(cmd, manufacturer);
                    break;
            }
        }
        
        $scope.save = function () {
            $scope.saving = true;
            if ($scope.cmd === 'add') {
                ApiService.list('product',  
                    { search : 
                        { $and: 
                             [  { comp_type: $scope.product.comp_type  },
                                { model: new RegExp('^'+ $scope.product.model + '$', "i") },
                                { sub_model: new RegExp('^'+ $scope.product.sub_model + '$', "i") },
                                { revision: new RegExp('^'+ $scope.product.revision + '$', "i") },
                                { _manufacturer : $scope.product._manufacturer._id }
                            ]
                        }
                    })
                .then(function (results) {
                    if (results.data.count > 0) {
                        dialogs.error('오류', '해당 부품형식이 이미 존재합니다.');
                        $scope.saving = false;
                        return;
                    }
                    else
                        postProduct($scope.cmd, $scope.product);
                }, function (err) {
                    dialogs.error('오류', '부품형식 정보를 내려받을 수 없습니다. 문제가 지속되면 시스템관리자에게 문의하여 주십시오.');
                    $scope.saving = false;
                }); 
            }
            else 
                postProduct($scope.cmd, $scope.product);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .controller('MfgDlgCtrl', function ($scope, $filter, $modalInstance, dialogs, ApiService, Enums, manufacturer, manufacturers, cmd) {
        $scope.cmd = cmd;

        if ($scope.cmd === 'mod') {
            $scope.manufacturer = manufacturer;
            $scope.manufacturers = manufacturers;
            console.log('$scope.manufacturer', $scope.manufacturer);
        }
        else {
            $scope.manufacturer = { };
        }

        console.log('manufacturer', manufacturer);

        var postManufacturer = function (cmd, manufacturer) {
            var pb = null;
            var noti = (cmd === 'add') ? '추가' : '수정';

            if (cmd === 'add') 
                pb = ApiService.add('manufacturer', manufacturer);
            else 
                pb = ApiService.update('manufacturer', manufacturer);

            if (pb) {
                pb.then(function (results) {
                    console.log('then called, results: ', results);
                    $scope.manufacturer = results.data;
                    dialogs.notify('알림', $scope.manufacturer.name + '(이)가 성공적으로 ' + noti + '되었습니다.');
                }, function (err) {
                    console.log('then err called, err: ', err);
                    dialogs.error('오류', '부품제작자 ' + noti + '중 오류가 발생했습니다.');
                }).finally(function () {
                    $scope.saving = false;
                    $modalInstance.close($scope.manufacturer);
                });    
            }
            else {
                dialogs.error('오류', '부품제작자 ' + noti + '중 오류가 발생했습니다.');
                $scope.saving = false;
            }

        }
        
        $scope.save = function () {
            $scope.saving = true;
            if ($scope.cmd === 'add') {
                console.log('manufacturer: ', $scope.manufacturer);
                ApiService.list('manufacturer', {search : {name: new RegExp('^'+ $scope.manufacturer.name + '$', "i")}}).then(function (results) {
                    console.log('results: ', results);
                    if (results.data.count > 0) {
                        var dlg = dialogs.confirm('확인', '해당 이름을 가진 부품제작자가 이미 있습니다. 그래도 추가하시겠습니까?');
                        dlg.result.then(function (btn) {
                            postManufacturer($scope.cmd, $scope.manufacturer);
                        });
                    }
                    else
                        postManufacturer($scope.cmd, $scope.manufacturer);
                }, function (err) {
                    console.log('ApiService.list err: ', err);
                    dialogs.error('오류', '부품제작자 정보를 내려받을 수 없습니다. 문제가 지속되면 시스템관리자에게 문의하여 주십시오.');
                    $scope.saving = false;
                }); 
            }
            else 
                postManufacturer($scope.cmd, $scope.manufacturer);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .controller('BuilderDlgCtrl', function ($scope, $filter, $modalInstance, dialogs, ApiService, Enums, builder, builders, cmd, type) {
        $scope.cmd = cmd;

        console.log('builder', builder);

        if ($scope.cmd === 'mod') {
            $scope.builder = builder;
            $scope.builders = builders;
            console.log('$scope.builder', $scope.builder);
        }
        else {
            $scope.builder = {type: type};
        }

        var postBuilder = function (cmd, builder) {
            var pb = null;
            var noti = (cmd === 'add') ? '추가' : '수정';

            if (cmd === 'add') 
                pb = ApiService.add('builder', builder);
            else 
                pb = ApiService.update('builder', builder);

            if (pb) {
                pb.then(function (results) {
                    console.log('then called, results: ', results);
                    $scope.builder = results.data;
                    dialogs.notify('알림', $scope.builder.name + '(이)가 성공적으로 ' + noti + '되었습니다.');
                }, function (err) {
                    console.log('then err called, err: ', err);
                    dialogs.error('오류', '항공기제작자 ' + noti + '중 오류가 발생했습니다.');
                }).finally(function () {
                    $scope.saving = false;
                    $modalInstance.close($scope.builder);
                });    
            }
            else {
                dialogs.error('오류', '항공기제작자 ' + noti + '중 오류가 발생했습니다.');
                $scope.saving = false;
            }

        }
        
        $scope.save = function () {
            $scope.saving = true;
            if ($scope.cmd === 'add') {
                ApiService.list('builder', {search : { name: new RegExp('^'+ $scope.builder.name + '$', "i")}}).then(function (results) {
                    if (results.data.count > 0) {
                        var dlg = dialogs.confirm('확인', '해당 이름을 가진 항공기제작자가 이미 있습니다. 그래도 추가하시겠습니까?');
                        dlg.result.then(function (btn) {
                            postBuilder($scope.cmd, $scope.builder);
                        });
                    }
                    else
                        postBuilder($scope.cmd, $scope.builder);
                }, function (err) {
                    dialogs.error('오류', '항공기제작자 정보를 내려받을 수 없습니다. 문제가 지속되면 시스템관리자에게 문의하여 주십시오.');
                    $scope.saving = false;
                }); 
            }
            else 
                postBuilder($scope.cmd, $scope.builder);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });