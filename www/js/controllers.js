'use strict';

/* Controllers */

var oaktreeUrl = 'http://oaktree.nodejitsu.com/';

function LoginCtrl($scope, navSvc, $http, userService){
  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };
  $scope.username = '';
  $scope.password = '';
  $scope.fetch = function(){
    var userUrl = oaktreeUrl +'user/login/'+ $scope.username+'/'+$scope.password;
    $http.get(userUrl)
      .success(function(u, getRes){
        userService.setUser(u);
        var usersUrl = oaktreeUrl +'user/';
        $http.get(usersUrl)
          .success(function(users, getRes2){
            userService.setAllUsers(users);
          });
        $scope.slidePage('/newmessage');
      }).error(function(u, getRes){

      });
  };
}


function SignUpCtrl($scope, navSvc, userService, $http){
  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };
  $scope.username = '';
  $scope.password = '';
  $scope.fetch = function(){
    var userUrl = oaktreeUrl +'user/new/'+ $scope.username+'/'+$scope.password;
    $http.get(userUrl)
      .success(function(u, getRes){
        userService.setUser(u);
        var usersUrl = oaktreeUrl +'user/';
        $http.get(usersUrl)
          .success(function(users, getRes2){
            userService.setAllUsers(users);
          });
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
    // $scope.friends = userService.currentUser.friends;
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
    _.each($filter('filter')($scope.currentFriends, {checked:true}), function(value){
      receiverIds.push(value._id);
    });
    hatchService.set('receiver_ids', receiverIds);
    console.log('hatch', hatchService.hatchObject);
    $http.post(oaktreeUrl +'message/', hatchService.hatchObject)
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
      $scope.messages = res;
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


function showPinsCtrl ($scope, navSvc, $rootScope, $navigate, $location) {

  var test = {
    0: {
      _id: 0,
      latlng: {
        lat: 37.7838055,
        lng: -122.40897059999998
      },
      read: false
    },
    1: {
      _id: 1,
      latlng: {
        lat: 37.75398870275125,
        lng: -122.40359544754028
      },
      read: false
    },
    2: {
      _id: 2,
      latlng: {
        lat: 37.75656740515542,
        lng: -122.40295171737671
      },
      read: true
    },
    3: {
      _id: 3,
      latlng: {
        lat: 37.7838055,
        lng: -122.406
      },
      read: false
    }
  }
  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
    console.log('map slide page', path)
  };

  var map;
  var pinAdded = false;
  var marker;
  var circle;
  var bounds;
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
      radius: 300
    };
    circle = new google.maps.Circle(circleOptions);
    bounds = circle.getBounds();

    dropPins();
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
  }

  var dropPins = function(){
    for (var pin in test) {
      var pinLocation = new google.maps.LatLng(test[pin].latlng.lat, test[pin].latlng.lng)
      var pinName = test[pin]._id;
      if ( bounds.contains( pinLocation ) ) {
        addPin(test[pin].latlng.lat, test[pin].latlng.lng, pinName, usemarker)
      } else {
        addPin(test[pin].latlng.lat, test[pin].latlng.lng, pinName)
      }
    }
  }
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

  var image = {
    url: './img/message.png',
    size: new google.maps.Size(50, 50),
  }


  var addPin = function(lat, lng, newPin, usemarker) {
    var myLatlng = new google.maps.LatLng(lat, lng);
    if (usemarker){
      var pinName = newPin;
      newPin = new google.maps.Marker({
        _id: pinName,
        position: myLatlng,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: image
      });
      google.maps.event.addListener(newPin, 'click', function() {
        $scope.slidePage('/home');
        $scope.$apply();
        clearInterval(handle);
        newPin.setMap(null);
      });
    
    } else {
      newPin = new google.maps.Marker({
        position: myLatlng,
        map: map,
        animation: google.maps.Animation.DROP
      });
    }
    var marker = newPin;
  }
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

