'use strict';

angular.module('insApp')
    .controller('CertificateDetailCtrl', function ($scope, $http, $state, $stateParams, $filter, $modal, $q, socket, Enums, dialogs, ApiService) {
        if (!$scope.showdetail || !$scope.certificate)
            $state.go('certificate.list');
    });