'use strict';

/* Controllers */

var oaktreeUrl = 'http://oaktree.nodejitsu.com/';

function LoginCtrl($scope, navSvc, $http, userService){
  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };
  $scope.username = '';
  $scope.password = '';
  $scope.bootUp = function(){
    try {
        var userPass = window.localStorage.getItem("powuseee");
        $scope.username = userPass.split(':')[0];
        $scope.password = userPass.split(':')[1];
        $scope.fetch('login/');
    } catch (e){
      console.log('Error getting userpass', e);
    }
  };
  $scope.fetch = function(fetchRoute){
    var userUrl = oaktreeUrl +'user/'+ fetchRoute + $scope.username+'/'+$scope.password;
    $http.get(userUrl)
      .success(function(u, getRes){
        userService.setUser(u);
        var usePass = $scope.username+":"+$scope.password;
        window.localStorage.setItem("powuseee", usePass);
        $http.get(oaktreeUrl +'user/')
          .success(function(users, getRes2){
            userService.setAllUsers(users);
          });
        if (app.userToken){
          $http.get(oaktreeUrl + 'user/token/'+u._id+'/'+app.userToken)
            .success(function(u, getRes3){
            });
        };
        $scope.slidePage('/newmessage');
      }).error(function(u, getRes){
      });
  };
}


function FriendsListCtrl($scope, $filter, navSvc, userService, hatchService, imageService, $http){
  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };
  $scope.pendingFriends = [];
  $scope.currentFriends = [];
  $scope.updateFriendList = function(){
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
  };
  $scope.acceptFriend = function(userObj){
    $http.get(oaktreeUrl+'friends/accept/'+userObj._id+'/'+userService.currentUser._id)
      .success(function(u, getRes){
        userObj.invited = 1;
      });
  };

  $scope.friendClass = function(user){
    if (user.invited){
      return 'is-disabled';
    }
  }
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
        console.log('data', data);
      }).error(function(data, status){
        console.log('err data', data);
        console.log('err status', status);
      });

    imageService.set('receiver_ids', receiverIds);
    $http.post(oaktreeUrl +'image/', imageService.image)
      .success(function(data, status, headers, config){
        console.log('data', data);
      }).error(function(data, status){
        console.log('err data', data);
        console.log('err status', status);
      });
  };
}


function UsersCtrl($scope, navSvc, userService, $http){
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
      })
  };
  $scope.itemClass = function(user){
    if (user.added){
      return 'is-disabled';
    }
  };
}


function InboxCtrl($scope, $filter, navSvc, userService, $http){
  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };
  $scope.messages = userService.allMessages;
  $scope.getMessages = function(){
    var url = oaktreeUrl +'message/retrieve/' + userService.currentUser._id.toString();
    $http.get(url).success(function(res, status, headers){
      userService.setMessages(res);
      $scope.messages = res;
      console.log(userService.allMessages)
    }).error(function(){
    });
  };
  $scope.setCurrent = function(message){
    userService.setCurrentRead(message);
  };
}


function MessageReadCtrl($scope, navSvc, userService){
  $scope.message = userService.currentRead;
}

function HomeCtrl($scope,navSvc,$rootScope, userService) {
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
}

function NewMessage($scope, navSvc, userService, hatchService, imageService){
  $scope.title = '';
  $scope.content = '';
  $scope.hidden = false;

  $scope.next = function(path){
    hatchService.set('title', $scope.title);
    hatchService.set('content', $scope.content);
    hatchService.set('hidden', $scope.hidden);
    navSvc.slidePage(path);
  };
  $scope.takePic = function() {
      var options =   {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
          encodingType: 0     // 0=JPG 1=PNG
      }
      // Take picture using device camera and retrieve image as base64-encoded string
      navigator.camera.getPicture(onSuccess,onFail,options);
  };
  var onSuccess = function(imageData) {
      console.log("On Success! ");
      $scope.picData = "data:image/jpeg;base64," +imageData;
      $scope.$apply();
      imageService.set('picData', $scope.picData);
      $('.userPic').show();
  };
  var onFail = function(e) {
      console.log("On fail " + e);
  };

  $scope.removeImage = function(){
    $('.userPic').hide();
    hatchService.set('picData', null);
  }
}

function newPinCtrl($scope, navSvc, $rootScope, hatchService) {
  var map;
  var pinAdded = false;
  var marker;

  $scope.title = 'Choose Location'

  navigator.geolocation.getCurrentPosition(function(position) {
    $scope.position=position;
    map.setCenter(new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude));
    addPin($scope.position.coords.latitude, $scope.position.coords.longitude);
  },function(e) { console.log("Error retrieving position " + e.code + " " + e.message) });

  $scope.initialize = function() {
    setTimeout(function(){
      var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.getElementById('map-canvas'),
          mapOptions);

    }, 10);
  }

  var addPin = function(lat, lng) {
    if (!pinAdded){
      pinAdded = true;
      var myLatlng = new google.maps.LatLng(lat, lng);
      marker = new google.maps.Marker({
        position: myLatlng,
        draggable: true,
        map: map,
        animation: google.maps.Animation.DROP
      });
      hatchService.set('latlng', {
        lat: lat,
        lng: lng
       });
      google.maps.event.addListener(marker, 'dragend', function() { console.log(marker.position)
        hatchService.set('latlng', {
          lat: marker.position.mb,
          lng: marker.position.nb
        });
      });
    }
  }
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

function showPinsCtrl ($scope, navSvc, userService, $http) {

  $scope.getMessages = function(){
    var url = oaktreeUrl +'message/retrieve/' + userService.currentUser._id.toString();
    $http.get(url).success(function(res, status, headers){
      userService.setReceivedMessages(res.inbox);
      userService.setSentMessages(res.outbox);
      console.log(userService.currentUser)
    }).error(function(){
    });
  };

  var map, circle, bounds;
  var pinAdded = false;
  var usemarker = true;

  $scope.title = 'My Pins';

  navigator.geolocation.getCurrentPosition(function(position) {
    $scope.position = position;
    map.setCenter(new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude));

    var circleLatlng = new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude);
    var circleOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: circleLatlng,
      radius: 1000
    };
    circle = new google.maps.Circle(circleOptions);
    bounds = circle.getBounds();

    dropPins(userService.sentMessages);
    dropPins(userService.receivedMessages);
    geoLocate();
  },function(e) { console.log("Error retrieving position " + e.code + " " + e.message) });

  var handle;
  var geoLocate = function(){
    handle = setInterval(function(){
      navigator.geolocation.getCurrentPosition(function(position) {
        var newLatlng = new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude);
        circle.setCenter(newLatlng);
        // map.setCenter(newLatlng)
      });
    }, 3000);
  };


  $scope.initialize = function() {
    setTimeout(function(){
      var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.getElementById('map-canvas'),
          mapOptions);
    }, 10);
  };

  var images = {
    message: {
      url: './img/message.png',
      size: new google.maps.Size(50, 50),
    },
    egg: {
      url: './img/yoshiegg.png',
      size: new google.maps.Size(50, 50),
    },
    box: {
      url: './img/checkbox_unchecked_dark.png',
      size: new google.maps.Size(50, 50),
    }
  }

  var dropPins = function(messageType){
    var eventType;
    for (var i = 0; i < messageType.length; i++) {
      var instance = messageType[i];
      var pinLocation = new google.maps.LatLng(instance.latlng.lat, instance.latlng.lng)

      if (messageType === userService.sentMessages) {
        if (instance.status === 1){
          eventType = 0;
          addPin(instance, images.box, eventType);
        } else if (instance.status === 0){
          eventType = 0;
          addPin(instance, images.box, eventType);
        }
      } else if (messageType === userService.receivedMessages && instance.status !== 1) {
        if ( bounds.contains( pinLocation ) ) {
          eventType = 1;
          addPin(instance, images.message, eventType);
        } else {
          addPin(instance, images.egg);
        }
      }
    }
  };


  var addPin = function(instance, image, eventType) {
    var myLatlng = new google.maps.LatLng(instance.latlng.lat, instance.latlng.lng);
    console.log(eventType)
    var newPin = new google.maps.Marker({
      _id: instance._id,
      position: myLatlng,
      map: map,
      animation: google.maps.Animation.DROP,
      icon: image
    });
    if (eventType !== 'undefined'){
      if (eventType === 0){
          console.log('zero')
        google.maps.event.addListener(newPin, 'click', function() {
          userService.setCurrentRead(instance);
          $scope.$apply();
          console.log(userService.currentRead)
          clearInterval(handle);
          navSvc.slidePage('/messageRead');
          $scope.$apply();
        });
      }
      if (eventType === 1){
        console.log('1')
        google.maps.event.addListener(newPin, 'click', function() {
          //need to tell server this message has been read
          newPin.setMap(null);
          userService.setCurrentRead(instance);
          $scope.$apply();
          console.log(userService.currentRead)
          clearInterval(handle);
          navSvc.slidePage('/messageRead');
          $scope.$apply();
        });
      }
    }
  };

};


function NotificationCtrl($scope) {
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
}


function GeolocationCtrl($scope,navSvc,$rootScope) {
    navigator.geolocation.getCurrentPosition(function(position) {
        $scope.position=position;
        $scope.$apply();
        },function(e) { console.log("Error retrieving position " + e.code + " " + e.message) });

    $scope.back = function () {
        navSvc.back();
    };
}

function DeviceCtrl($scope) {
    $scope.device = device;
}


function ContactsCtrl($scope, userService) {
    $scope.allUsers = userService.allUsers;
    $scope.find = function() {
        $scope.contacts = [];
        var options = new ContactFindOptions();
        //options.filter=""; //returns all results
        options.filter=$scope.searchTxt;
        options.multiple=true;
        var fields = ["displayName", "name", "phoneNumbers"];
        navigator.contacts.find(fields,function(contacts) {
            $scope.contacts=contacts;
            $scope.$apply();
        },function(e){console.log("Error finding contacts " + e.code)},options);
    };
};

function CameraCtrl($scope) {
        // Take picture using device camera and retrieve image as base64-encoded string
    var onSuccess = function(imageData) {
        console.log("On Success! ");
        $scope.picData = "data:image/jpeg;base64," +imageData;
        hatchService.set('picData', $scope.picData);
        $scope.$apply();
    };
    var onFail = function(e) {
        console.log("On fail " + e);
    };
    navigator.camera.getPicture(onSuccess,onFail,{
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        encodingType: 0     // 0=JPG 1=PNG
    });
}

function TestCtrl($scope){
  $scope.doubletapped = function(){
    // navigator.notification.alert("Sample Alert",function() {console.log("Alert success")},"My Alert","Close");
    $scope.text = 'doubletapped';
  };
  $scope.dragged = function(){
    $scope.text = 'dragged';
  }
  $scope.swipe = function(){
    $scope.text = 'swipe';
  }
  $scope.hold = function(){
    $scope.text = 'hold';
  }
}
