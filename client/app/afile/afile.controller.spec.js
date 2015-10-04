'use strict';

describe('Controller: AFileCtrl', function () {

  // load the controller's module
  beforeEach(module('insApp'));
  beforeEach(module('socketMock'));

  var AFileCtrl,
      scope,
      $httpBackend;

  // Initialize the controller and a mock scope
  /*
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/manufacturers')
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

    scope = $rootScope.$new();
    ManufacturerCtrl = $controller('ManufacturerCtrl', {
      $scope: scope
    });
  }));
  */
  it('should attach a list of afiles to the scope', function () {
    $httpBackend.flush();
  });
});
