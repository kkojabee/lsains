'use strict';

angular.module('insApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
      $scope.menu = [
        { 'title': 'Home', 'link': '/' },
        { 'title': 'Manufacturers', 'link': '/manufacturer' },
        { 'title': 'Products', 'link': '/product' },
        { 'title': 'Aircrafts', 'link': '/aircraft/list' },
        { 'title': 'FlightSafety', 'link': '/flightsafety/list' },
        { 'title': 'Certificate', 'link': '/certificate/list' },
        { 'title': 'AFiles', 'link': '/afile' },
        { 'title': 'Dialogs', 'link': '/dialog' },
      ];

      $scope.isCollapsed = true;
      $scope.isLoggedIn = Auth.isLoggedIn;
      $scope.isAdmin = Auth.isAdmin;
      $scope.getCurrentUser = Auth.getCurrentUser;

      $scope.logout = function () {
          Auth.logout();
          $location.path('/login');
      };

      $scope.isActive = function (route) {
          return route === $location.path();
      };
  });