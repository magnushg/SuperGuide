angular.module('superguide', ['firebase'])
  .controller('superController', ['$scope', '$firebase', function($scope, $firebase) {
    var ref = new Firebase("https://superguide.firebaseio.com/Position/");
    var sync = $firebase(ref);




    //var syncObject = sync.$asObject();
    $scope.users = sync.$asArray();
    //syncObject.$bindTo($scope, "userData");

      window.p = $scope.users;

    $scope.position = {lat: 58.77, lng: 10.77};


  }]);
