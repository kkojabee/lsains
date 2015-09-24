'use strict';

angular.module('insApp')
  .factory('AircraftService', function ($rootScope, $http, socket) {
      var promise;
      var apiUrl = '/api/aircrafts';
      var aircrafts = [];
      var serialize = function(obj, prefix) {
          var str = [];
          for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
              var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
              str.push(typeof v == "object" ?
                serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
          }
          return str.join("&");
     };

      return {
          async: function () {
              if (!promise) {
                  promise = $http.get(apiUrl).then(function (response) {
                      // The then function here is an opportunity to modify the response

                      socket.syncUpdates(response.data.type, response.data.result, function (event, item, array) {
                          $rootScope.$broadcast(response.data.type, { event: event, item: item });
                      });

                      // The return value gets picked up by the then in the controller.
                      return response.data;
                  });
              }
              // Return the promise to the controller
              return promise;
          },
          list: function (params) {
              var query = serialize(parms);
              var url = apiUrl + (query ? '?' + query : null);
              $http.get(url);
          },
          get: function (id) {
              return $http.get(apiUrl + '/' + id);
          },
          update: function (data) {
              return $http.put(apiUrl  + '/' + data._id, data);
          },
          add: function (data) {
              return  $http.post(apiUrl, data);
          },
          delete: function (id) {
              return $http.delete(apiUrl  + '/' + id);
          },
      };
  });
