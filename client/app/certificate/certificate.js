'use strict';

angular.module('insApp')
  .config(function ($stateProvider) {
      $stateProvider
      .state('certificate', {
          abstract: true,
          url: '/certificate',
          templateUrl: 'app/certificate/certificate.html',
          controller: 'CertificateCtrl'
      })
      .state('certificate.list', {
          url: '/list',
          templateUrl: 'app/certificate/certificate.list.html',
          controller: 'CertificateListCtrl'
      })
      .state('certificate.detail', {
          url: '/detail',
          templateUrl: 'app/certificate/certificate.detail.html',
          controller: 'CertificateDetailCtrl'
      })
  });
