'use strict';

angular.module('insApp')
  .config(function ($stateProvider) {
      $stateProvider
      .state('flightsafety', {
          abstract: true,
          url: '/flightsafety',
          templateUrl: 'app/flightsafety/flightsafety.html',
          controller: 'FlightSafetyCtrl'
      })
      .state('flightsafety.list', {
          url: '/list',
          templateUrl: 'app/flightsafety/flightsafety.list.html',
          controller: 'FlightSafetyListCtrl'
      })
      .state('flightsafety.detail', {
          url: '/detail',
          templateUrl: 'app/flightsafety/flightsafety.detail.html',
          controller: 'FlightSafetyDetailCtrl'
      })
  });
