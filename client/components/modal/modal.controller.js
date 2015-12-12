'use strict';

angular.module('insApp')
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
                templateUrl: 'app/template/productModal.html',
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
                templateUrl: 'app/template/manufacturerModal.html',
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
    .controller('OwnerDlgCtrl', function ($scope, $filter, $modalInstance, dialogs, ApiService, Enums, owner, owners, cmd) {
        $scope.cmd = cmd;

        if ($scope.cmd === 'mod') {
            $scope.owner = owner;
            $scope.owners = owners;
            console.log('$scope.owner', $scope.owner);
        }
        else {
            $scope.owner = { };
        }

        console.log('owner', owner);

        var postOwner = function (cmd, owner) {
            var pb = null;
            var noti = (cmd === 'add') ? '추가' : '수정';

            if (cmd === 'add') 
                pb = ApiService.add('owner', owner);
            else 
                pb = ApiService.update('owner', owner);

            if (pb) {
                pb.then(function (results) {
                    console.log('then called, results: ', results);
                    $scope.owner = results.data;
                    dialogs.notify('알림', $scope.owner.name + '(이)가 성공적으로 ' + noti + '되었습니다.');
                }, function (err) {
                    console.log('then err called, err: ', err);
                    dialogs.error('오류', '소유자 ' + noti + '중 오류가 발생했습니다.');
                }).finally(function () {
                    $scope.saving = false;
                    $modalInstance.close($scope.owner);
                });    
            }
            else {
                dialogs.error('오류', '소유자 ' + noti + '중 오류가 발생했습니다.');
                $scope.saving = false;
            }

        }
        
        $scope.save = function () {
            $scope.saving = true;
            if ($scope.cmd === 'add') {
                console.log('owner: ', $scope.owner);
                ApiService.list('owner', {search : {name: new RegExp('^'+ $scope.owner.name + '$', "i")}}).then(function (results) {
                    console.log('results: ', results);
                    if (results.data.count > 0) {
                        var dlg = dialogs.confirm('확인', '해당 이름을 가진 ' + results[0].desc + '가 이미 있습니다. 그래도 추가하시겠습니까?');
                        dlg.result.then(function (btn) {
                            postOwner($scope.cmd, $scope.owner);
                        });
                    }
                    else
                        postOwner($scope.cmd, $scope.owner);
                }, function (err) {
                    console.log('ApiService.list err: ', err);
                    dialogs.error('오류', '소유자 정보를 내려받을 수 없습니다. 문제가 지속되면 시스템관리자에게 문의하여 주십시오.');
                    $scope.saving = false;
                }); 
            }
            else 
                postOwner($scope.cmd, $scope.owner);
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
    })
    .controller('CertAddDlgCtrl', function ($scope, $filter, $modalInstance, $q, dialogs, Enums, ApiService, aircraft, ins_type) {
        $scope.regLabel = "등록부호";
        $scope.date_pub = (new Date()).toISOString().slice(0,10);
        $scope.enums = Enums;

        if (aircraft) {
            $scope.reg_no = aircraft.reg_no;
            $scope.aircraft = aircraft;
            $scope.d_reg_no = true;
        }
        if (ins_type) {
            $scope.ins_type = ins_type;
            $scope.d_ins_type = true;
        }

        $scope.regExistCheckAsync = function(value) {
            return $q(function(resolve, reject) {
                if (!value) return resolve();
                var regNo = value.toUpperCase().replace("HL-C", "HLC");
                ApiService.list('aircraft', {search : {reg_no: regNo, reg_status: 'REG'}}).then(function (results) {
                    if (results.data.count > 0) {
                        $scope.aircraft = results.data.result[0];
                        if ($scope.aircraft.lsa_category == 'LSA')
                            $scope.regLabel = "등록부호";
                        else
                            $scope.regLabel = "신고번호";
                        $scope.reg_no = $scope.aircraft.reg_no;
                        console.log('$scope.reg_no: ', $scope.reg_no);
                        resolve();
                    }
                    else
                        reject();
                }, function (err) {
                    resolve();
                });     
            });
        }

        $scope.save = function () {
            $modalInstance.close({aircraft: $scope.aircraft, ins_type: $scope.ins_type, type: $scope.type, date_pub: $scope.date_pub});
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });;