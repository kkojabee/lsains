'use strict';

angular.module('insApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'ui.validate',
  'cgBusy',
  'angularFileUpload',
  'dialogs.main', 
  'dialogs.default-translations',
  'pascalprecht.translate',
  'angularUtils.directives.dirPagination'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
      $urlRouterProvider
        .when("/aircraft", "/aircraft/list")
        .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })
  .config(
    ['$animateProvider',
    function ($animateProvider) {
        $animateProvider.classNameFilter(/carousel/);
    }])
  .config(function(paginationTemplateProvider) {
    paginationTemplateProvider.setPath('assets/templates/dirPagination.tpl.html');
  })
  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });