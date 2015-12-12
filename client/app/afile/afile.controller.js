'use strict';

angular.module('insApp')
    .controller('AFileCtrl', function ($scope, $rootScope, $filter, FileUploader, $translate, dialogs, Enums, ApiService) {
        $scope.enums = Enums;
        $scope.currentPage = 1;
        $scope.pageSize = 5;
        var dlg, fcount, fcurrent, fileSizeLimit = 20 * 1024 * 1024;
        $scope.fileTypes = angular.copy(Enums.fileTypes);
        $scope.fileTypes.unshift({ label: '전체', value: 'ALL' });

        var filters = [{
                name: 'SIZE_Filter',
                fn: function (item, options) {
                        return item.size <= fileSizeLimit;
                }
            }, {
                name: 'IMG_Filter',
                fn: function (item, options) {
                        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            }];

        var uploader = $scope.uploader = new FileUploader({
            url: 'api/afiles',
            alias: Enums.FILE_TYPE.GEN.value,
            autoUpload: true,
            filters: [filters[0]]
        });

        if(!$scope.file_type)
            $scope.file_type = $scope.fileTypes[0].value;
        
        $scope.fileTypeChange = function (file_type) {
            if (file_type == 'ALL')
                uploader.alias = 'GEN';
            else
                uploader.alias = file_type;    
            
            //setFilter(file_type);
            if (file_type == 'IMG')
                angular.element('#input_file').attr("accept", "image/*");
            else
                angular.element('#input_file').removeAttr("accept");
        }

        $scope.fileSearch = function (row) {
            if ($scope.file_type === 'ALL')
                return (angular.lowercase(row.file_name).indexOf(angular.lowercase($scope.fquery) || '') !== -1);
            else 
                return (angular.lowercase(row.file_name).indexOf(angular.lowercase($scope.fquery) || '') !== -1 &&
                    row.file_type === $scope.file_type);
        };

        $scope.fileSort = function(keyname){
            $scope.fileSortKey = keyname;
            $scope.fileReverse = !$scope.fileReverse;
        }

        $scope.delAFiles = function () {
            var ids = [];
            angular.forEach($scope.afiles, function (afile) {
                if (afile.selected)
                    ids.push(afile._id);
            });

            if (ids.length < 1) {
                dialogs.notify('알림', '삭제할 파일을 선택하여 주십시오.');
                return;
            }

            var dlg = dialogs.confirm('확인', '선택한 파일을 삭제하시겠습니까?');
            dlg.result.then(function (btn) {

                angular.forEach(ids, function (id) {
                    ApiService.delete('afile', id);
                    _.remove($scope.afiles, { _id: id });
                });
            }, function (btn) {
                
            });
        }

        $scope.init = function (afiles, ftype) {
            //console.info('$scope.afiles: ', $scope.afiles);
            //console.info('$scope.init afiles: ', afiles);
            //$scope.afiles = afiles;
            $scope.ftype = ftype ? ftype : Enums.FILE_TYPE.GEN.value;
            uploader.alias = $scope.ftype;

            //setFilter($scope.ftype);
        };

        var setFilter = function (ftype) {
            var filterName = ftype + '_Filter';
            var filter = $filter('filter')(filters, { name: filterName })[0];
            uploader.filters = [];

            if (filter)
                uploader.filters.push(filter);
        };

        // CALLBACKS
        uploader.onWhenAddingFileFailed = function (item, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
            if (filter && filter.name === 'SIZE_Filter')
                dialogs.error('에러', item.name + ' 파일을 업로드 할 수 없습니다.<br/>업로드 파일 최대 크기는 20MB입니다.');
            else
                dialogs.error('에러', item.name + ' 파일을 업로드 할 수 없습니다.<br/>문제가 계속되면 시스템 관리자에게 문의하여 주십시오.');
        };
        uploader.onAfterAddingFile = function (fileItem) {
            //console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function (addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
            fcount = uploader.queue.length;
            fcurrent = 1;
            dlg = dialogs.create('/dialogs/wait_upload.html', 'waitUploadDialogCtrl', { progress: 0 }, 'lg');
            dlg.result.then(function (name) {

            }, function () {

            });
        };
        uploader.onBeforeUploadItem = function (item) {
            console.info('onBeforeUploadItem', item);
            var factor = fcurrent + '/' + fcount;
            $rootScope.$broadcast('dialogs.wait.progress', { 'factor': factor, 'msg': (item._file.name + ' uploading...') });
        };
        uploader.onProgressItem = function (fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function (progress) {
            console.info('onProgressAll', progress);
            $rootScope.$broadcast('dialogs.wait.progress', { 'progress': progress });
        };
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            response.afile.isnew = true;
            $scope.afiles.push(response.afile);
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function (fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
            if (uploader.isUploading) uploader.cancelAll();
            $rootScope.$broadcast('dialogs.wait.complete');
            dialogs.error('에러', '파일 업로드 중 오류가 발생했습니다.<br/>오류가 계속되면 시스템 담당자에게 연락하여 주십시오.');
        };
        uploader.onCancelItem = function (fileItem, response, status, headers) {
            //console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function (fileItem, response, status, headers) {
            fcurrent++;
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function () {
            $rootScope.$broadcast('dialogs.wait.complete');
            console.info('onCompleteAll');
        };
    })
    .controller('AImageCtrl', function ($scope, $rootScope, $filter, FileUploader, $translate, dialogs, Enums, ApiService) {
        $scope.enums = Enums;
        var dlg, fcount, fcurrent, fileSizeLimit = 20 * 1024 * 1024;

        var filters = [{
                name: 'SIZE_Filter',
                fn: function (item, options) {
                        return item.size <= fileSizeLimit;
                }
            }, {
                name: 'IMG_Filter',
                fn: function (item, options) {
                        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            }];

        var uploader = $scope.uploader = new FileUploader({
            url: 'api/afiles',
            alias: Enums.FILE_TYPE.IMG.value,
            autoUpload: true,
            filters: filters
        });

        $scope.delAImage = function () {
            var dlg = dialogs.confirm('확인', '현재 이미지를 삭제하시겠습니까?');
            dlg.result.then(function (btn) {
                var id = $scope.aimages[$scope.carouselIndex]._id;
                ApiService.delete('afile', id);
                _.remove($scope.aimages, { _id: id });
            }, function (btn) {
                
            });
        }
        
        $scope.delAImage2 = function () {
            var dlg = dialogs.confirm('확인', '현재 이미지를 삭제하시겠습니까?');
            dlg.result.then(function (btn) {
                var aimage = _.find($scope.aimages, { active: true });
                if (aimage) {
                    var id = aimage._id;
                    ApiService.delete('afile', id);
                    _.remove($scope.aimages, { _id: id });
                }
            }, function (btn) {
                
            });
        }

        $scope.init = function (aimages) {
            //$scope.aimages = aimages;
            //console.info('$scope.aimages: ', $scope.aimages);
            //console.info('$scope.init aimages: ', aimages);
        };

        // CALLBACKS
        uploader.onWhenAddingFileFailed = function (item, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
            if (filter && filter.name === 'SIZE_Filter')
                dialogs.error('에러', item.name + ' 파일을 업로드 할 수 없습니다.<br/>업로드 파일 최대 크기는 20MB입니다.');
            else
                dialogs.error('에러', item.name + ' 파일을 업로드 할 수 없습니다.<br/>문제가 계속되면 시스템 관리자에게 문의하여 주십시오.');
        };
        uploader.onAfterAddingFile = function (fileItem) {
            //console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function (addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
            fcount = uploader.queue.length;
            fcurrent = 1;
            dlg = dialogs.create('/dialogs/wait_upload.html', 'waitUploadDialogCtrl', { progress: 0 }, 'lg');
            dlg.result.then(function (name) {

            }, function () {

            });
        };
        uploader.onBeforeUploadItem = function (item) {
            console.info('onBeforeUploadItem', item);
            var factor = fcurrent + '/' + fcount;
            $rootScope.$broadcast('dialogs.wait.progress', { 'factor': factor, 'msg': (item._file.name + ' uploading...') });
        };
        uploader.onProgressItem = function (fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function (progress) {
            console.info('onProgressAll', progress);
            $rootScope.$broadcast('dialogs.wait.progress', { 'progress': progress });
        };
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            response.afile.isnew = true;
            $scope.aimages.push(response.afile);
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function (fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
            if (uploader.isUploading) uploader.cancelAll();
            $rootScope.$broadcast('dialogs.wait.complete');
            dialogs.error('에러', '파일 업로드 중 오류가 발생했습니다.<br/>오류가 계속되면 시스템 담당자에게 연락하여 주십시오.');
        };
        uploader.onCancelItem = function (fileItem, response, status, headers) {
            //console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function (fileItem, response, status, headers) {
            fcurrent++;
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function () {
            $rootScope.$broadcast('dialogs.wait.complete');
            console.info('onCompleteAll');
        };
    })
    .controller('waitUploadDialogCtrl', ['$scope', '$modalInstance', '$translate', '$timeout', 'data', function ($scope, $modalInstance, $translate, $timeout, data) {
        //-- Variables -----//

        $scope.header = (angular.isDefined(data.header)) ? data.header : $translate.instant('DIALOGS_PLEASE_WAIT_ELIPS');
        $scope.msg = (angular.isDefined(data.msg)) ? data.msg : $translate.instant('DIALOGS_PLEASE_WAIT_MSG');
        $scope.progress = (angular.isDefined(data.progress)) ? data.progress : 100;
        $scope.factor = (angular.isDefined(data.factor)) ? data.factor : '';
        $scope.uploader = (angular.isDefined(data.uploader)) ? data.uploader : null;

        //-- Listeners -----//

        // Note: used $timeout instead of $scope.$apply() because I was getting a $$nextSibling error

        // close wait dialog
        $scope.$on('dialogs.wait.complete', function () {
            $timeout(function () { $modalInstance.close(); $scope.$destroy(); });
        }); // end on(dialogs.wait.complete)

        // update the dialog's message
        $scope.$on('dialogs.wait.message', function (evt, args) {
            $scope.msg = (angular.isDefined(args.msg)) ? args.msg : $scope.msg;
        }); // end on(dialogs.wait.message)

        // update the dialog's progress (bar) and/or message
        $scope.$on('dialogs.wait.progress', function (evt, args) {
            $scope.msg = (angular.isDefined(args.msg)) ? args.msg : $scope.msg;
            $scope.progress = (angular.isDefined(args.progress)) ? args.progress : $scope.progress;
            $scope.factor = (angular.isDefined(args.factor)) ? args.factor : $scope.factor;
        }); // end on(dialogs.wait.progress)

        //-- Methods -----//

        $scope.getProgress = function () {
            return { 'width': $scope.progress + '%' };
        }; // end getProgress

        $scope.cancel = function () {
            if ($scope.uploader && $scope.uploader.isUploading) $scope.uploader.cancelAll();
            $modalInstance.dismiss('Canceled');
        }; // end cancel
    } ])
    .config(['dialogsProvider', '$translateProvider', function (dialogsProvider, $translateProvider) {
        dialogsProvider.useBackdrop('static');
        dialogsProvider.useEscClose(false);
        dialogsProvider.useCopy(false);
        dialogsProvider.setSize('sm');

        $translateProvider.translations('en-US', {
            DIALOGS_ERROR: "Error",
            DIALOGS_ERROR_MSG: "An unknown error has occurred.",
            DIALOGS_CLOSE: "Close",
            DIALOGS_PLEASE_WAIT: "Please Wait",
            DIALOGS_PLEASE_WAIT_ELIPS: "Please Wait...",
            DIALOGS_PLEASE_WAIT_MSG: "Wait on operation to complete.",
            DIALOGS_PERCENT_COMPLETE: "% Complete",
            DIALOGS_NOTIFICATION: "Notification",
            DIALOGS_NOTIFICATION_MSG: "Unknown application notification.",
            DIALOGS_CONFIRMATION: "Confirmation",
            DIALOGS_CONFIRMATION_MSG: "Confirmation required.",
            DIALOGS_OK: "Ok",
            DIALOGS_YES: "Yes",
            DIALOGS_NO: "No"
        });

        $translateProvider.translations('ko-KR', {
            DIALOGS_ERROR: "에러",
            DIALOGS_ERROR_MSG: "오류가 발생했습니다.",
            DIALOGS_CLOSE: "닫기",
            DIALOGS_PLEASE_WAIT: "대기",
            DIALOGS_PLEASE_WAIT_ELIPS: "대기중...",
            DIALOGS_PLEASE_WAIT_MSG: "잠시만 기다려 주십시오.",
            DIALOGS_PERCENT_COMPLETE: "% 완료",
            DIALOGS_NOTIFICATION: "알림",
            DIALOGS_NOTIFICATION_MSG: "알 수 없는 앱 알림.",
            DIALOGS_CONFIRMATION: "확인",
            DIALOGS_CONFIRMATION_MSG: "확인이 필요합니다.",
            DIALOGS_OK: "Ok",
            DIALOGS_YES: "예",
            DIALOGS_NO: "아니오"
        });

        $translateProvider.preferredLanguage('ko-KR');
    } ])
    .run(['$templateCache', '$interpolate', function ($templateCache, $interpolate) {
        // get interpolation symbol (possible that someone may have changed it in their application instead of using '{{}}')
        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();

        $templateCache.put('/dialogs/wait_upload.html', '<div class="modal-header dialog-header-wait"><h4 class="modal-title"><span class="glyphicon glyphicon-time"></span> ' + startSym + 'header' + endSym + '</h4></div><div class="modal-body"><p ng-bind-html="msg"></p><div class="progress progress-striped active"><div class="progress-bar progress-bar-info" ng-style="getProgress()"><i>{{factor}}</i></div></div></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="cancel()">Cancel</button></div>');
    } ]);