'use strict';

angular.module('insApp')
  .factory('ApiService', function ($rootScope, $http, socket) {
      var promises = [];
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

     var findPromise = function(type) {
        var item = _.find(promises, { type: type });
        return item ? item.val : null;
     };

     var addPromise = function(type, promise) {
        var item = findPromise(type);
        if (item)
            item.val = promise;
        else
            promises.push({ type: type, val: promise });
     };

     var getApiUrl = function(type) {
        if (type === 'flightsafety')
          return '/api/flightsafeties';          
        else
         return '/api/' + type + 's';
     };
      
    return {
          async: function (type) {
              var promise = findPromise(type);
              if (!promise) {
                  var apiUrl = getApiUrl(type);
                  promise = $http.get(apiUrl).then(function (response) {
                      // The then function here is an opportunity to modify the response
                      socket.syncUpdates(response.data.type, response.data.result, function (event, item, array) {
                          $rootScope.$broadcast(response.data.type, { event: event, item: item });
                      });

                      // The return value gets picked up by the then in the controller.
                      return response.data;
                  });
                  addPromise(type, promise);
              }
              // Return the promise to the controller
              return promise;
          },
          list: function (type, params) {
              var query = $.param(params);
              var url = getApiUrl(type) + (query ? '?' + query : '');
              return $http.get(url);
          },
          get: function (type, id) {
              return $http.get(getApiUrl(type) + '/' + id);
          },
          update: function (type, data) {
              return $http.put(getApiUrl(type)  + '/' + data._id, data);
          },
          add: function (type, data) {
              return  $http.post(getApiUrl(type), data);
          },
          delete: function (type, id) {
              return $http.delete(getApiUrl(type)  + '/' + id);
          }
      };
  });
