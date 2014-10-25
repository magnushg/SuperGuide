angular.module('superguide', ['firebase'])
  .controller('superController', ['$scope', '$firebase', function($scope, $firebase) {
    var ref = new Firebase("https://superguide.firebaseio.com/Position/89470305121008177854/Trackings");
    var sync = $firebase(ref);

    //var syncObject = sync.$asObject();
    $scope.positions = sync.$asArray();
    //syncObject.$bindTo($scope, "userData");

    $scope.position = {lat: 58.77, lng: 10.77};

  }]);
