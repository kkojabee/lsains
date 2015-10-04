'use strict';

describe('Controller: ManufacturerCtrl', function () {

  // load the controller's module
  beforeEach(module('insApp'));
  beforeEach(module('socketMock'));

  var ManufacturerCtrl,
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
  it('should attach a list of manufacturers to the scope', function () {
    $httpBackend.flush();
    expect(scope.aircraftManufacturers.length).toBe(2);
  });
});
