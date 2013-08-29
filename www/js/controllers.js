'use strict';

/* Controllers */

var oaktreeUrl = 'http://oaktree.nodejitsu.com/';

var LoginCtrl = function($scope, navSvc, $http, userService, locationService){
  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };
  $scope.username = '';
  $scope.password = '';
  $scope.bootUp = function(){
    try {
      var userPass = window.localStorage.getItem("powuseee");
      $scope.username = userPass.split(':')[0].toLowerCase();
      $scope.password = userPass.split(':')[1];

      var userObj = {
        username: $scope.username,
        password: $scope.password
      };

      $scope.fetch('login/', userObj);
    } catch (e){
      console.log('Error getting userpass', e);
    }
  };
  var incorrect = false;
  $(document).bind("keydown", function (event) {
    if (incorrect){
      // $scope.$apply(function (){
      $('.signInPswd').css("color", "black");
      $('.signUpPswd').css("color", "black");
      incorrect = false;
      // });
    }
  });

  $scope.login = function(){
    var userObj = {
        username: $scope.username,
        password: $scope.password
      };
      $scope.fetch('login/', userObj);
  };

  $scope.fetch = function(fetchRoute, userObject){
    $http.post(oaktreeUrl +'user/'+ fetchRoute, JSON.stringify(userObject))
            .success(function(u, getRes){
              userService.setUser(u);
              var usePass = userObject.username+":"+userObject.password;
              window.localStorage.setItem("powuseee", usePass);
              $http.get(oaktreeUrl +'user/')
                .success(function(users, getRes2){
                  userService.setAllUsers(users);
                });
              if(app.userToken){
                $http.get(oaktreeUrl + 'user/token/'+u._id+'/'+app.userToken)
                  .success(function(u, getRes3){
                  });
              }
              $scope.slidePage('/newmessage');
            })
            .error(function(data, status){
              $('.signInPswd').css("color", "red");
              incorrect = true;
            });
  };

  $scope.signUp = function(fetchRoute){
    if ($scope.password === $scope.pswdCheck){
      var userObj = {
        username: $scope.username.toLowerCase(),
        password: $scope.password,
        phone: $scope.phone
      };
      $scope.fetch(fetchRoute, userObj);
    } else {
      $('.signUpPswd').css("color", "red");
      incorrect = true;
    }
  };
};


var FriendsListCtrl = function($scope, $filter, navSvc, userService, hatchService, imageService, $http){
  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };
  $scope.pendingFriends = [];
  $scope.currentFriends = [];
  $scope.updateFriendList = function(){
    $http.get(oaktreeUrl+'friends/' + userService.currentUser._id)
      .success(function(u, getRes){
        userService.currentUser.friends = u;
        _.each(userService.currentUser.friends, function(userObj, key){
          userObj['checked'] = false;
          if (userObj.status === 0){
            userObj.pending = ' - pending';
            $scope.pendingFriends.push(userObj);
          } else if (userObj.status === 1){
            userObj.waiting = 1;
            $scope.pendingFriends.push(userObj);
          } else if (userObj.status === 2){
            $scope.currentFriends.push(userObj);
          }
        });
      });
  };
  $scope.acceptFriend = function(userObj){
    $http.get(oaktreeUrl+'friends/accept/'+userObj._id+'/'+userService.currentUser._id)
      .success(function(u, getRes){
        userObj.invited = 1;
      });
  };
  $scope.denyFriend = function(userObj){
    $http.get(oaktreeUrl + 'friends/deny/'+userObj._id+'/'+userService.currentUser._id)
      .success(function(u, getRes){
        userObj.invited = 1;
      });
  };

  $scope.friendClass = function(user){
    if (user.invited){
      return 'is-disabled';
    }
  };
  $scope.allUsers = userService.allUsers;
  $scope.selectedFriends = $filter('filter')($scope.currentFriends, {checked:true});

  var receiverIds = [];
  $scope.send = function(){
    // build the object
    hatchService.set('sender_id', userService.currentUser._id);
    hatchService.set('sender_name', userService.currentUser.username);
    _.each($filter('filter')($scope.currentFriends, {checked:true}), function(value){
      receiverIds.push(value._id);
    });
    hatchService.set('receiver_ids', receiverIds);
    console.log('hatch', hatchService.hatchObject);
    $http.post(oaktreeUrl +'message/', JSON.stringify(hatchService.hatchObject))
      .success(function(data, status, headers, config){
        console.log('send message success data', data);
        if (imageService.photo && typeof imageService.photo.photo !== 'undefined') {
          console.log('attaching image...');
          var messageIds = '?';
          for (var i = 0; i < data.length; i++){
            messageIds+= i+'='+data[i]._id+'&';
          }
          messageIds.substring(0, messageIds.length-1);
          console.log('hatch obj', hatchService.hatchObject);
          console.log('image obj', imageService.photo);
          $http.post(oaktreeUrl + 'image/' + messageIds, imageService.photo)
            .success(function(u, getRes){
              console.log('photo u', u);
              console.log('photo res', getRes);
              hatchService.clear();
              imageService.clear();
            })
            .error(function(data, status){
              console.log('error status', status);
              console.log('error data', data);
              hatchService.clear();
              imageService.clear();
            });
        } else {
          hatchService.clear();
          imageService.clear();
        }
      }).error(function(data, status){
        console.log('send msg err status', status);
        hatchService.clear();
        imageService.clear();
      });
  };
};


var UsersCtrl = function($scope, navSvc, userService, $http){
  $scope.updateUserList = function(){
    $http.get(oaktreeUrl +'user/')
      .success(function(u, getRes){
        userService.setAllUsers(u);
        $scope.users = u;
        var matchUserObj = {};
        for (var j = 0; j < $scope.users.length; j++){
          if (userService.currentUser._id === $scope.users[j]._id){
            $scope.users.splice(j, 1);
          } else {
            matchUserObj[$scope.users[j]._id] = j;
          }
        }
        for (var i = 0; i < userService.currentUser.friends.length; i++){
          if (matchUserObj[userService.currentUser.friends[i]._id]){ // if the userId is in the match user Obj
            $scope.users[matchUserObj[userService.currentUser.friends[i]._id]].added = 1; // find array slot. add a new property to it. array slot j.
          }
        }
      }).error(function(u, getRes){
      });
  };
  $scope.add = function(user){
    user.added = 1;
    $http.get(oaktreeUrl +'friends/add/'+userService.currentUser._id+'/'+user._id)
      .success(function(u, getRes){
      });
  };
  $scope.itemClass = function(user){
    if (user.added){
      return 'is-disabled';
    }
  };
};

var getDistance = function(lat1, lon1, lat2, lon2){
  var R = 6371;
  return Math.acos(Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2) * Math.cos(lon2-lon1)) * R;
};


var InboxCtrl = function($scope, $filter, navSvc, userService, $http, locationService){
  navigator.geolocation.getCurrentPosition(function(position) {
    locationService.position= { lat: position.coords.latitude, lng: position.coords.longitude };
  },function(e) { console.log("Error retrieving position " + e.code + " " + e.message) });

  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };
  $scope.getMessages = function(){
    var url = oaktreeUrl +'message/retrieve/' + userService.currentUser._id.toString();
    $http.get(url).success(function(res, status, headers){
      userService.buildFriendLookup();
      userService.setReceivedMessages(res.inbox);
      console.log('received messages', userService.receivedMessages);
      _.each(userService.receivedMessages, function(message){
        if (typeof message.latlng !== 'undefined' && Object.keys(message.latlng) > 0 ){
          message['distance'] = getDistance(locationService.position.lat,locationService.position.lng,message.latlng.lat,message.latlng.lng);
        } else {
          message['distance'] = 0;
        }

      });
      userService.setSentMessages(res.outbox);
      console.log('user sent messages', userService.sentMessages);
      _.each(userService.sentMessages, function(messageObj){
        messageObj['receiverName'] = userService.friendObj[messageObj.receiver_id];
      });
      $scope.receivedMessages = userService.receivedMessages;
      $scope.sentMessages = userService.sentMessages;
      console.log('res', res);
    }).error(function(){
    });
  };
  $scope.setCurrent = function(message){
    userService.setCurrentRead(message);
  };
  $scope.tryOpen = function(message){
    if (message.distance < 150){
      userService.setCurrentRead(message);
      if(message.status !== 1){
        $scope.slidePage('messageRead');
      } else {
        navigator.notification.alert('You already read this =P',function() {console.log("Alert success")},'Ooooops!',"Close");
      }
    } else {
      navigator.notification.alert('You need to be closer by '+ $filter('distmeters')(message.distance-150),function() {console.log("Alert success")},'Almost!',"Close");
    }
  };
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

  $http.get(oaktreeUrl+'message/read/'+userService.currentRead._id)
    .success(function(u, getRes){
      console.log('Message read');
    });
};

var HomeCtrl = function($scope,navSvc,$rootScope, userService) {
    $rootScope.showSettings = false;
    $scope.user = userService.currentUser;
    $scope.slidePage = function (path,type) {
        navSvc.slidePage(path,type);
    };
    $scope.back = function () {
        navSvc.back();
    };
    $scope.changeSettings = function () {
        $rootScope.showSettings = true;
    };
    $scope.closeOverlay = function () {
        $rootScope.showSettings = false;
    };
};

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
        mapTypeId: google.maps.MapTypeId.ROADMAP
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
           lat: marker.position.mb,
           lng: marker.position.nb
         });
       });
      google.maps.event.addListener(marker, 'dragend', function() {
        console.log(marker.position);
        hatchService.set('latlng', {
          lat: marker.position.mb,
          lng: marker.position.nb
        });
      });
    }
  };
};

var showPinsCtrl = function($scope, navSvc, userService, locationService, $http, mapService) {

  $scope.getMessages = function(){
    var url = oaktreeUrl +'message/retrieve/' + userService.currentUser._id.toString();
    $http.get(url).success(function(res, status, headers){
      userService.setReceivedMessages(res.inbox);
      userService.setSentMessages(res.outbox);
      $scope.initialize();
    }).error(function(){
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
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var circleLatlng = new google.maps.LatLng(locationService.position.lat, locationService.position.lng);
    var circleOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
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
      size: new google.maps.Size(25, 25)
    },
    greenegg: {
      url: './img/greenegg.png',
      size: new google.maps.Size(25, 25)
    },
    blueegg: {
      url: './img/blueegg.png',
      size: new google.maps.Size(25, 25)
    }
  };

  var dropPins = function(messageType){
    var eventType;
    for (var i = 0; i < messageType.length; i++) {
      var instance = messageType[i];
      var pinLocation = new google.maps.LatLng(instance.latlng.lat, instance.latlng.lng);

      if (messageType === userService.sentMessages) {
        eventType = 0;
        addPin(instance, images.blueegg, eventType);
      } else if (messageType === userService.receivedMessages && instance.status !== 1 && instance.hidden !== false) {
        if ( bounds.contains( pinLocation ) ) {
          eventType = 1;
          addPin(instance, images.greenegg, eventType);
        } else {
          addPin(instance, images.redegg);
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


var NotificationCtrl = function($scope) {
    $scope.alertNotify = function() {
        navigator.notification.alert("Sample Alert",function() {console.log("Alert success")},"My Alert","Close");
    };

    $scope.beepNotify = function() {
        navigator.notification.beep(1);
    };

    $scope.vibrateNotify = function() {
        navigator.notification.vibrate(3000);
    };

    $scope.confirmNotify = function() {
        navigator.notification.confirm("My Confirmation",function(){console.log("Confirm Success")},"Are you sure?",["Ok","Cancel"]);
    };
};


var GeolocationCtrl = function($scope,navSvc,$rootScope) {
    navigator.geolocation.getCurrentPosition(function(position) {
        $scope.position=position;
        $scope.$apply();
        },function(e) { console.log("Error retrieving position " + e.code + " " + e.message); });

    $scope.back = function () {
        navSvc.back();
    };
};

var DeviceCtrl = function($scope) {
    $scope.device = device;
};


var ContactsCtrl = function($scope, userService, $http) {
    $scope.find = function() {
      navigator.contacts.find(["phoneNumbers"],function(contacts) {
        var contactsObj = {contacts: contacts};
        $http.post(oaktreeUrl+'user/phonefind/', JSON.stringify(contactsObj))
          .success(function(u, getRes){
            $scope.contacts = u;
            console.log('friends', u);
          })
          .error(function(u, getRes){
            console.log('error on contacts', u);
          });
      },function(e){console.log("Error finding contacts " + e.code);},{multiple: true});
    };
};

// var CameraCtrl = function($scope) {
//         // Take picture using device camera and retrieve image as base64-encoded string
//     var onSuccess = function(imageData) {
//         console.log("On Success! ");
//         $scope.picData = "data:image/jpeg;base64," +imageData;
//         hatchService.set('picData', $scope.picData);
//         $scope.$apply();
//     };
//     var onFail = function(e) {
//         console.log("On fail " + e);
//     };
//     navigator.camera.getPicture(onSuccess,onFail,{
//         quality: 50,
//         destinationType: Camera.DestinationType.DATA_URL,
//         sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
//         encodingType: 0     // 0=JPG 1=PNG
//     });
// }

var TestCtrl = function($scope){
  $scope.doubletapped = function(){
    // navigator.notification.alert("Sample Alert",function() {console.log("Alert success")},"My Alert","Close");
    $scope.text = 'doubletapped';
  };
  $scope.dragged = function(){
    $scope.text = 'dragged';
  };
  $scope.swipe = function(){
    $scope.text = 'swipe';
  };
  $scope.hold = function(){
    $scope.text = 'hold';
  };
};
