angular.module('insApp').
  filter('lsaRegNo', function () {
      return function (text) {
          return String(text).toUpperCase().replace('HLC', 'HL-C');
      }
  }
);