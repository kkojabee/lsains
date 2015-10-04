'use strict';

angular.module('insApp')
  .factory('ManufacturerService', function ($rootScope, $http, socket) {
      var promise;
      var manufacturers = [];

      return {
          async: function () {
              if (!promise) {
                  promise = $http.get('/api/manufacturers').then(function (response) {
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
          update: function (data) {
              $http.put('/api/manufacturers/' + data._id, data);
          },
          add: function (data) {
              $http.post('/api/manufacturers', data);
          },
          delete: function (id) {
              $http.delete('/api/manufacturers/' + id);
          },
      };
  });
