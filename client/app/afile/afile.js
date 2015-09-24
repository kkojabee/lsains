'use strict';

angular.module('insApp')
  .config(function ($stateProvider) {
      $stateProvider
      .state('afile', {
          url: '/afile',
          templateUrl: 'app/afile/afile.html',
          controller: 'AFileCtrl'
      });
  });
