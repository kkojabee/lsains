'use strict';

angular.module('insApp')
  .factory('ProductService', function ($rootScope, $http, socket) {
      var promise;
      var products = [];

      return {
          async: function () {
              if (!promise) {
                  promise = $http.get('/api/products').then(function (response) {
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
              $http.put('/api/products/' + data._id, data);
          },
          add: function (data) {
              $http.post('/api/products', data);
          },
          delete: function (id) {
              $http.delete('/api/products/' + id);
          },
      };
  });
