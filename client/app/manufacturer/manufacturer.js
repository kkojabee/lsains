'use strict';

angular.module('insApp')
  .config(function ($stateProvider) {
      $stateProvider
      .state('manufacturer', {
          url: '/manufacturer',
          templateUrl: 'app/manufacturer/manufacturer.html',
          controller: 'ManufacturerCtrl'
      });
  });
