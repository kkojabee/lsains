'use strict';

angular.module('insApp')
  .config(function ($stateProvider) {
      $stateProvider
      .state('aircraft', {
          abstract: true,
          url: '/aircraft',
          templateUrl: 'app/aircraft/aircraft.html',
          controller: 'AircraftCtrl'
      })
      .state('aircraft.list', {
          url: '/list',
          templateUrl: 'app/aircraft/aircraft.list.html',
          controller: 'AircraftListCtrl'
      })
      .state('aircraft.detail', {
          url: '/detail',
          templateUrl: 'app/aircraft/aircraft.detail.html',
          controller: 'AircraftDetailCtrl'
      })
  });
