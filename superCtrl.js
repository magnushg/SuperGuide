angular.module('superguide', ['firebase'])
  .controller('superController', ['$scope', '$firebase', function($scope, $firebase) {
    var ref = new Firebase("https://superguide.firebaseio.com/Position");
    var sync = $firebase(ref);

    $scope.message = sync.$asObject();

    $scope.position = {lat: 58.77, lng: 10.77};


  }]);
