angular.module('superguide', [])
  .controller('superController', ['$scope', function($scope) {
    $scope.message = "Hello world";
    $scope.position = {lat: 58.77, lng: 10.77}; 
  }]);
