angular.module('superguide', ['firebase'])
  .controller('superController', ['$scope', '$firebase', function($scope, $firebase) {
    var ref = new Firebase("https://superguide.firebaseio.com/Position/");
    var broadcastref = new Firebase("https://superguide.firebaseio.com/BroadcastMessage");
    var sync = $firebase(ref);
    var messageSync = $firebase(broadcastref);



    //var syncObject = sync.$asObject();
    $scope.users = sync.$asArray();
    //syncObject.$bindTo($scope, "userData");
    var message = messageSync.$asObject();
    message.$bindTo($scope, "message");
    $scope.position = {lat: 58.77, lng: 10.77};


  }]);
