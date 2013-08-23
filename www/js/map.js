var createMap = function($scope, navSvc, $rootScope){

  $scope.slidePage = function (path,type) {
    console.log('in slidepage')
    navSvc.slidePage(path,type);
  };

  var map;


  var initialize = setTimeout(function(){
      var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById('map-canvas'),
          mapOptions);
    }, 10);
    return map;
  }

  var image = {
    url: './img/message.png',
    size: new google.maps.Size(50, 50),
  }
}