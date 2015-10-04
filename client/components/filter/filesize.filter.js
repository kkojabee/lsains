angular.module('insApp').
  filter('fileSize', function () {
      return function (size) {
          var nsize = parseInt(size);
          if (!nsize) return null;

          if (nsize >= (1024 * 1024 * 1024))
              return ((nsize/(1024 * 1024 * 1024)).toFixed(1) + 'GB');
          else if (nsize >= (1024 * 1024))
              return ((nsize / (1024 * 1024)).toFixed(1) + 'MB');
          else if (nsize >= 1024)
              return ((nsize / 1024).toFixed(1) + 'KB');
          else
              return (nsize + 'B');

      }
  }
);