'use strict';

angular.module('insApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('dialog', {
        url: '/dialog',
        templateUrl: 'app/dialog/dialog.html',
        controller: 'DialogCtrl'
      });
  });