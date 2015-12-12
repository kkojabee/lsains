'use strict';

describe('Controller: FlightSafetyCtrl', function () {

  // load the controller's module
  beforeEach(module('insApp'));
  beforeEach(module('socketMock'));

  var FlightSafetyCtrl,
      scope,
      $httpBackend;

  // Initialize the controller and a mock scope
  /*
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/products')
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

    scope = $rootScope.$new();
    ProductCtrl = $controller('ProductCtrl', {
      $scope: scope
    });
  }));
  */
  it('should attach a list of flightsafety to the scope', function () {
    $httpBackend.flush();
    expect(scope.flightsafeties.length).toBe(2);
  });
});
