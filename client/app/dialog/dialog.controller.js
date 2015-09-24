'use strict';

angular.module('insApp')
  .controller('DialogCtrl', function ($scope, $rootScope, $timeout, $translate, dialogs) {

      //-- Variables --//

      $scope.lang = 'en-US';
      $scope.language = 'English';

      var _progress = 33;
      var _factor = '1/4';

      $scope.name = '';
      $scope.confirmed = 'No confirmation yet!';

      $scope.custom = {
          val: 'Initial Value'
      };

      //-- Listeners & Watchers --//

      $scope.$watch('lang', function (val, old) {
          switch (val) {
              case 'en-US':
                  $scope.language = 'English';
                  break;
              case 'ko-KR':
                  $scope.language = 'Korean';
                  break;
              case 'es':
                  $scope.language = 'Spanish';
                  break;
          }
      });

      //-- Methods --//

      $scope.setLanguage = function (lang) {
          $scope.lang = lang;
          $translate.use(lang);
      };

      $scope.launch = function (which) {
          switch (which) {
              case 'error':
                  dialogs.error();
                  break;
              case 'wait':
                  var dlg = dialogs.wait(undefined, undefined, _progress);
                  _fakeWaitProgress();
                  break;
              case 'notify':
                  dialogs.notify();
                  break;
              case 'confirm':
                  var dlg = dialogs.confirm();
                  dlg.result.then(function (btn) {
                      $scope.confirmed = 'You confirmed "Yes."';
                  }, function (btn) {
                      $scope.confirmed = 'You confirmed "No."';
                  });
                  break;
              case 'custom':
                  var dlg = dialogs.create('/dialogs/custom.html', 'customDialogCtrl', {}, 'lg');
                  dlg.result.then(function (name) {
                      $scope.name = name;
                  }, function () {
                      if (angular.equals($scope.name, ''))
                          $scope.name = 'You did not enter in your name!';
                  });
                  break;
              case 'custom2':
                  var dlg = dialogs.create('/dialogs/custom2.html', 'customDialogCtrl2', $scope.custom, 'lg');
                  break;
              case 'custom3':
                  _progress = 0;
                  var dlg = dialogs.create('/dialogs/wait2.html', 'wait2DialogCtrl', { progress: _progress }, 'lg');
                  dlg.result.then(function (name) {

                  }, function () {

                  });

                  _fakeWaitProgress();
                  break;
          }
      }; // end launch

      var _fakeWaitProgress = function () {
          $timeout(function () {
              if (_progress < 100) {
                  _progress += 33;
                  $rootScope.$broadcast('dialogs.wait.progress', { 'progress': _progress, 'msg': (_progress + '% complete'), 'factor': _factor });
                  _fakeWaitProgress();
              } else {
                  $rootScope.$broadcast('dialogs.wait.complete');
              }
          }, 1000);
      };
  }) // end controller(dialogsServiceTest)

	.controller('customDialogCtrl', function ($scope, $modalInstance, data) {
	    //-- Variables --//

	    $scope.user = { name: '' };

	    //-- Methods --//

	    $scope.cancel = function () {
	        $modalInstance.dismiss('Canceled');
	    }; // end cancel

	    $scope.save = function () {
	        $modalInstance.close($scope.user.name);
	    }; // end save

	    $scope.hitEnter = function (evt) {
	        if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.user.name, null) || angular.equals($scope.user.name, '')))
	            $scope.save();
	    };
	}) // end controller(customDialogCtrl)

	.controller('customDialogCtrl2', function ($scope, $modalInstance, data) {

	    $scope.data = data;

	    //-- Methods --//

	    $scope.done = function () {
	        $modalInstance.close($scope.data);
	    }; // end done

	})
/**
* Wait Dialog Controller 
*/
    .controller('wait2DialogCtrl', ['$scope', '$modalInstance', '$translate', '$timeout', 'data', function ($scope, $modalInstance, $translate, $timeout, data) {
        //-- Variables -----//

        $scope.header = (angular.isDefined(data.header)) ? data.header : $translate.instant('DIALOGS_PLEASE_WAIT_ELIPS');
        $scope.msg = (angular.isDefined(data.msg)) ? data.msg : $translate.instant('DIALOGS_PLEASE_WAIT_MSG');
        $scope.progress = (angular.isDefined(data.progress)) ? data.progress : 100;
        $scope.factor = (angular.isDefined(data.factor)) ? data.factor : '';

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
            $modalInstance.dismiss('Canceled');
        }; // end cancel
    } ])
    .config(['dialogsProvider', '$translateProvider', function (dialogsProvider, $translateProvider) {
        dialogsProvider.useBackdrop('static');
        dialogsProvider.useEscClose(false);
        dialogsProvider.useCopy(false);
        dialogsProvider.setSize('sm');

        $translateProvider.translations('es', {
            DIALOGS_ERROR: "Error",
            DIALOGS_ERROR_MSG: "Se ha producido un error desconocido.",
            DIALOGS_CLOSE: "Cerca",
            DIALOGS_PLEASE_WAIT: "Espere por favor",
            DIALOGS_PLEASE_WAIT_ELIPS: "Espere por favor...",
            DIALOGS_PLEASE_WAIT_MSG: "Esperando en la operacion para completar.",
            DIALOGS_PERCENT_COMPLETE: "% Completado",
            DIALOGS_NOTIFICATION: "Notificacion",
            DIALOGS_NOTIFICATION_MSG: "Notificacion de aplicacion Desconocido.",
            DIALOGS_CONFIRMATION: "Confirmacion",
            DIALOGS_CONFIRMATION_MSG: "Se requiere confirmacion.",
            DIALOGS_OK: "Bueno",
            DIALOGS_YES: "Si",
            DIALOGS_NO: "No"
        });

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

	    $templateCache.put('/dialogs/custom.html', '<div class="modal-header"><h4 class="modal-title"><span class="glyphicon glyphicon-star"></span> User\'s Name</h4></div><div class="modal-body"><ng-form name="nameDialog" novalidate role="form"><div class="form-group input-group-lg" ng-class="{true: \'has-error\'}[nameDialog.username.$dirty && nameDialog.username.$invalid]"><label class="control-label" for="course">Name:</label><input type="text" class="form-control" name="username" id="username" ng-model="user.name" ng-keyup="hitEnter($event)" required><span class="help-block">Enter your full name, first &amp; last.</span></div></ng-form></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="cancel()">Cancel</button><button type="button" class="btn btn-primary" ng-click="save()" ng-disabled="(nameDialog.$dirty && nameDialog.$invalid) || nameDialog.$pristine">Save</button></div>');
	    $templateCache.put('/dialogs/custom2.html', '<div class="modal-header"><h4 class="modal-title"><span class="glyphicon glyphicon-star"></span> Custom Dialog 2</h4></div><div class="modal-body"><label class="control-label" for="customValue">Custom Value:</label><input type="text" class="form-control" id="customValue" ng-model="data.val" ng-keyup="hitEnter($event)"><span class="help-block">Using "dialogsProvider.useCopy(false)" in your applications config function will allow data passed to a custom dialog to retain its two-way binding with the scope of the calling controller.</span></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="done()">Done</button></div>');
	    $templateCache.put('/dialogs/wait2.html', '<div class="modal-header dialog-header-wait"><h4 class="modal-title"><span class="glyphicon glyphicon-time"></span> ' + startSym + 'header' + endSym + '</h4></div><div class="modal-body"><p ng-bind-html="msg"></p><div class="progress progress-striped active"><div class="progress-bar progress-bar-info" ng-style="getProgress()"><i>{{factor}}</i></div></div></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="cancel()">Cancel</button></div>');
	} ]);
