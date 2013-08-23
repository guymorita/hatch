'use strict';

/* Controllers */

var oaktreeUrl = 'http://oaktree.nodejitsu.com/';

function LoginCtrl($scope, navSvc, $http, userService){
  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };
  $scope.username = '';
  $scope.password = '';
  $scope.fetch = function(fetchRoute){
    var userUrl = oaktreeUrl +'user/'+ fetchRoute + $scope.username+'/'+$scope.password;
    $http.get(userUrl)
      .success(function(u, getRes){
        userService.setUser(u);
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
        $('#map').remove();
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

var newPinCtrl = function($scope, navSvc, $rootScope, hatchService) {
  navigator.geolocation.getCurrentPosition(function(position) {
      $scope.position=position;
      $scope.$apply();
      },function(e) { console.log("Error retrieving position " + e.code + " " + e.message) });

  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
    $('#map').remove();
  };

  $scope.latlng = {}
  var markerCreated = false;
  var newMap = new Map();//$scope.position.coords.latitude, $scope.position.coords.longitude);

  $scope.onMapClick = function(e) {
    if (!markerCreated){
      var marker = new L.marker(e.latlng, { bounceOnAdd: true, bounceOnAddOptions: {duration: 500, height: 50}});
      marker.addTo(newMap.map)
        .dragging.enable()
       $scope.latlng = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
       }
      hatchService.set('latlng', $scope.latlng);
      marker.on('dragend', function(e){
        $scope.latlng = {
          lat: e.target._latlng.lat,
          lng: e.target._latlng.lng
        }
      hatchService.set('latlng', $scope.latlng);
      });
      markerCreated = true;
    }
  }
  newMap.map.on('click', $scope.onMapClick);
};

var showPinsCtrl = function($scope,navSvc,$rootScope) {
  $scope.slidePage = function (path,type) {
    $('#map').remove();
    navSvc.slidePage(path,type);
  };

  var pinMap = new Map();

  var test = {
    0: {
      _id: 0,
      latlng: {
        lat: 37.75599059794776,
        lng: -122.41307973861694
      },
      message: 'helllooo'
    },
    1: {
      _id: 1,
      latlng: {
        lat: 37.75398870275125,
        lng: -122.40359544754028
      },
      message: 'shalom'
    },
    2: {
      _id: 2,
      latlng: {
        lat: 37.75656740515542,
        lng: -122.40295171737671
      },
      message: 'wazzza'
    }
  }

  var myLocationCreated = false;
  var circle;
  var onLocationFound = function(e) {
    if (myLocationCreated){
      $(circle._container).remove()
    }
    myLocationCreated = true;
    var radius = 50;
    circle = L.circle(e.latlng, radius).addTo(pinMap.map);
  }

  pinMap.map.on('locationfound', onLocationFound);

  setInterval(function(){
    pinMap.map.locate({setView: false});
  }, 3000);

  for (var pin in test) {
    var testmarker = new L.marker(test[pin].latlng);
    testmarker.addTo(pinMap.map);
    testmarker.bindPopup(test[pin].message);
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
