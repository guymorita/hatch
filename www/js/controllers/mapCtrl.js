'use strict';

var newPinCtrl = function($scope, navSvc, $rootScope, locationService, hatchService, mapService) {
  var pinMap;
  var pinAdded = false;
  var marker;

  $scope.title = 'Choose Location';

  $scope.initialize = function() {
    setTimeout(function(){
      var pinMapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(locationService.position.lat, locationService.position.lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true
      };
      pinMap = new google.maps.Map(document.getElementById('map-canvas'), pinMapOptions);
      addPin(locationService.position.lat, locationService.position.lng);

      var mapName = "pinMap";

      google.maps.event.clearListeners(pinMap, 'tilesloaded');
      google.maps.event.addListener(pinMap, 'zoom_changed', function(){
        mapService.saveMapState(pinMap, mapName);
      });
      google.maps.event.addListener(pinMap, 'dragend', function(){
        mapService.saveMapState(pinMap, mapName);
      });

      mapService.loadMapState(pinMap, mapName);

    }, 10);
  };

  var addPin = function(lat, lng) {
    if (!pinAdded){
      pinAdded = true;
      var myLatlng = new google.maps.LatLng(lat, lng);
      marker = new google.maps.Marker({
        position: myLatlng,
        draggable: true,
        map: pinMap,
        animation: google.maps.Animation.DROP
      });
      hatchService.set('latlng', {
        lat: lat,
        lng: lng
       });
      google.maps.event.addListener(pinMap, 'click', function(event) {
         marker.setPosition(event.latLng);
         hatchService.set('latlng', {
           lat: marker.position.ob,
           lng: marker.position.pb
         });
       });
      google.maps.event.addListener(marker, 'dragend', function() {
        hatchService.set('latlng', {
          lat: marker.position.ob,
          lng: marker.position.pb
        });
      });
    }
  };
};

var showPinsCtrl = function($scope, navSvc, userService, locationService, $http, mapService) {

  $scope.getMessages = function(){
    var url = userService.oaktreeUrl +'message/retrieve/' + userService.currentUser._id.toString();
    $http.get(url).success(function(res, status, headers){
      userService.setReceivedMessages(res.inbox);
      userService.setSentMessages(res.outbox);
      console.log(res.inbox)
      $scope.initialize();
    }).error(function(response, status){
      console.log('failed to get messages', response, status);
    });

  };

  var map, circle, bounds;
  var pinAdded = false;
  var usemarker = true;
  var infoWindows = [];

  $scope.title = 'My Pins';

  var handle;
  var geoLocate = function(){
    handle = setInterval(function(){
      navigator.geolocation.getCurrentPosition(function(position) {
        locationService.position= { lat: position.coords.latitude, lng: position.coords.longitude };
        var newLatlng = new google.maps.LatLng(locationService.position.lat, locationService.position.lng);
        circle.setCenter(newLatlng);
        // map.setCenter(newLatlng)
      });
    }, 3000);
  };


  $scope.initialize = function() {
    var mapOptions = {
      zoom: 10,
      center: new google.maps.LatLng(locationService.position.lat, locationService.position.lng),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var circleLatlng = new google.maps.LatLng(locationService.position.lat, locationService.position.lng);
    var circleOptions = {
      strokeColor: '#7859b0',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#7859b0',
      fillOpacity: 0.35,
      map: map,
      center: circleLatlng,
      radius: 150
    };
    circle = new google.maps.Circle(circleOptions);
    bounds = circle.getBounds();



    var mapName = "myMap";

    google.maps.event.clearListeners(map, 'tilesloaded');
    google.maps.event.addListener(map, 'zoom_changed', function(){
      mapService.saveMapState(map, mapName);
    });
    google.maps.event.addListener(map, 'dragend', function(){
      mapService.saveMapState(map, mapName);
    });

    mapService.loadMapState(map, mapName);

    dropPins(userService.sentMessages);
    dropPins(userService.receivedMessages);
    geoLocate();
  };

  var images = {
    redegg: {
      url: './img/redegg.png',
      size: new google.maps.Size(25, 33)
    },
    greenegg: {
      url: './img/greenegg.png',
      size: new google.maps.Size(25, 33)
    },
    blueegg: {
      url: './img/blueegg.png',
      size: new google.maps.Size(25, 33)
    }
  };

  var dropPins = function(messageType){
    var eventType;
    for (var i = 0; i < messageType.length; i++) {
      var instance = messageType[i];
      if (instance.latlng){
        var pinLocation = new google.maps.LatLng(instance.latlng.lat, instance.latlng.lng);

        if (messageType === userService.sentMessages) {
          eventType = 0;
          addPin(instance, images.blueegg, eventType);
        } else if (messageType === userService.receivedMessages && instance.status !== 1) {
          if ( bounds.contains( pinLocation ) ) {
            eventType = 1;
            addPin(instance, images.greenegg, eventType);
          } else if (!instance.hidden) {
            addPin(instance, images.redegg);
          }
        }
      }
    }
  };


  var addPin = function(instance, image, eventType) {
    var myLatlng = new google.maps.LatLng(instance.latlng.lat, instance.latlng.lng);
    var newPin = new google.maps.Marker({
      _id: instance._id,
      position: myLatlng,
      map: map,
      animation: google.maps.Animation.DROP,
      icon: image,
      title: instance.title
    });

    var infoWindow = new google.maps.InfoWindow({
      content: instance.title
    });

    infoWindows.push(infoWindow);

    google.maps.event.addListener(newPin, 'click', function() {
      for (var i = 0; i < infoWindows.length; i ++){
        infoWindows[i].close();
      }
      infoWindow.open(map, newPin);
    });

    if (eventType !== 'undefined'){
      if (eventType === 0){
        google.maps.event.addListener(newPin, 'dblclick', function() {
          userService.setCurrentRead(instance);
          $scope.$apply();
          clearInterval(handle);
          navSvc.slidePage('/messageRead');
          $scope.$apply();
        });
      }
      if (eventType === 1){
        google.maps.event.addListener(newPin, 'dblclick', function() {
          //need to tell server this message has been read
          newPin.setMap(null);
          userService.setCurrentRead(instance);
          $scope.$apply();
          clearInterval(handle);
          navSvc.slidePage('/messageRead');
          $scope.$apply();
        });
      }
    } else {

    }
  };

};
