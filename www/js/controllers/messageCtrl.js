'use strict';

var NewMessage = function($scope, navSvc, userService, hatchService, imageService, locationService){
  $scope.title = hatchService.hatchObject.title;
  $scope.content = hatchService.hatchObject.content;
  $scope.hidden = false;

  $scope.hide = function(){
    $scope.hidden = !$scope.hidden;
  }

  $scope.next = function(path){
    hatchService.set('title', $scope.title);
    hatchService.set('content', $scope.content);
    hatchService.set('hidden', $scope.hidden);
    navSvc.slidePage(path);
    console.log($scope.hidden)
  };
  $scope.takePic = function() {
    var options =   {
        quality: 40,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        encodingType: 0,     // 0=JPG 1=PNG
        targetWidth: 640,
        targetHeight: 1136
    };
    // Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onSuccess,onFail,options);
  };
  var onSuccess = function(imageData) {
    console.log("On Success! ");
    $scope.picData = "data:image/jpeg;base64," +imageData;
    $scope.$apply();
    imageService.set('photo', $scope.picData);
    $('.userPic').show();
  };
  var onFail = function(e) {
    console.log("On fail " + e);
  };

  $scope.removeImage = function(){
    $('.userPic').hide();
    imageService.set('photo', null);
  };

  navigator.geolocation.getCurrentPosition(function(position) {
    locationService.position= { lat: position.coords.latitude, lng: position.coords.longitude };
  },function(e) { console.log("Error retrieving position " + e.code + " " + e.message) });
};


var MessageReadCtrl = function($scope, navSvc, $http, userService){
  $scope.message = userService.currentRead;
    console.log(userService.currentRead.latlng);
  var latlng =  new google.maps.LatLng(userService.currentRead.latlng.lat, userService.currentRead.latlng.lng);
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'latLng': latlng}, function(results, status) {

    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {

      $scope.message.address = results[1].formatted_address;

      $scope.apply();
      } else {
        alert('No results found');
      }
    } else {
      alert('Geocoder failed due to: ' + status);
    }
  });

  $http.get(userService.oaktreeUrl+'message/read/'+userService.currentRead._id)
    .success(function(u, getRes){
      console.log('Message read');
    });
};