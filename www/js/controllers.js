'use strict';

/* Controllers */

// var oaktreeUrl = 'http://oaktree.nodejitsu.com/';

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
          userObj.checked = false;
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
    console.log('hatch obj', hatchService.hatchObject);
    // build the object
    hatchService.set('sender_id', userService.currentUser._id);
    hatchService.set('sender_name', userService.currentUser.username);
    _.each($filter('filter')($scope.currentFriends, {checked:true}), function(value){
      receiverIds.push(value._id);
    });
    hatchService.set('receiver_ids', receiverIds);
    console.log('hatch', hatchService.hatchObject.latlng);
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
  // $scope.updateUserList = function(){
  //   $http.get(oaktreeUrl +'user/')
  //     .success(function(u, getRes){
  //       userService.setAllUsers(u);
  //       $scope.users = u;
  //       var matchUserObj = {};
  //       for (var j = 0; j < $scope.users.length; j++){
  //         if (userService.currentUser._id === $scope.users[j]._id){
  //           $scope.users.splice(j, 1);
  //         } else {
  //           matchUserObj[$scope.users[j]._id] = j;
  //         }
  //       }
  //       for (var i = 0; i < userService.currentUser.friends.length; i++){
  //         if (matchUserObj[userService.currentUser.friends[i]._id]){ // if the userId is in the match user Obj
  //           $scope.users[matchUserObj[userService.currentUser.friends[i]._id]].added = 1; // find array slot. add a new property to it. array slot j.
  //         }
  //       }
  //     }).error(function(u, getRes){
  //     });
  // };
  $scope.updateUserList = function() {
    navigator.contacts.find(["phoneNumbers"],function(contacts) {
      var contactsObj = {contacts: contacts};
      $http.post(oaktreeUrl+'user/phonefind/', JSON.stringify(contactsObj))
        .success(function(u, getRes){
          // $scope.contacts = u;
          // console.log('friends', u);
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
        })
        .error(function(u, getRes){
          console.log('error on contacts', u);
        });
    },function(e){console.log("Error finding contacts " + e.code);},{multiple: true});
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

var ContactsCtrl = function($scope, userService, $http) {
  $scope.find = function() {
    navigator.contacts.find(["phoneNumbers"],function(contacts) {
      var contactsObj = {contacts: contacts};
      $http.post(oaktreeUrl+'user/phonefind/', JSON.stringify(contactsObj))
        .success(function(u, getRes){
          // $scope.contacts = u;
          // console.log('friends', u);
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
        })
        .error(function(u, getRes){
          console.log('error on contacts', u);
        });
    },function(e){console.log("Error finding contacts " + e.code);},{multiple: true});
  };
};

var getDistance = function(lat1, lon1, lat2, lon2){
  var R = 6371;
  return Math.acos(Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2) * Math.cos(lon2-lon1)) * R;
};


var InboxCtrl = function($scope, $filter, navSvc, userService, $http, locationService){
  navigator.geolocation.getCurrentPosition(function(position) {
    locationService.position= { lat: position.coords.latitude, lng: position.coords.longitude };
  },function(e) { console.log("Error retrieving position " + e.code + " " + e.message);});

  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };
  $scope.getMessages = function(){
    console.log('getting message');
    var url = oaktreeUrl +'message/retrieve/' + userService.currentUser._id.toString();
    $http.get(url).success(function(res, status, headers){
      console.log("got message success!");
      userService.buildFriendLookup();
      userService.setReceivedMessages(res.inbox);
      _.each(userService.receivedMessages, function(message){
        if (message.latlng){
          message.distance = getDistance(locationService.position.lat,locationService.position.lng,message.latlng.lat,message.latlng.lng);
          console.log('distance', message.distance);
        } else {
          message.distance = 0;
        }
      });
      userService.setSentMessages(res.outbox);
      _.each(userService.sentMessages, function(messageObj){
        messageObj['receiverName'] = userService.friendObj[messageObj.receiver_id];
      });
      $scope.receivedMessages = userService.receivedMessages;
      $scope.sentMessages = userService.sentMessages;
    }).error(function(u, getRes){
      console.log('error getting messages', u, getRes);
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

  $scope.delayed = function() {
    setTimeout($scope.start, 200);
  };

  $scope.start = function(){

    (function() {
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
          window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
          window.cancelAnimationFrame =
                  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
      }

      if (!window.requestAnimationFrame)
          window.requestAnimationFrame = function(callback, element) {
              var currTime = new Date().getTime();
              var timeToCall = Math.max(0, 16 - (currTime - lastTime));
              var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                      timeToCall);
              lastTime = currTime + timeToCall;
              return id;
          };

      if (!window.cancelAnimationFrame)
          window.cancelAnimationFrame = function(id) {
              clearTimeout(id);
          };
    }());


    /**
     * pull to refresh
     * @type {*}
     */
    var PullToRefresh = (function() {
      function Main(container, slidebox, slidebox_icon, handler) {
        var self = this;

        this.breakpoint = 80;

        this.container = container;
        this.slidebox = slidebox;
        this.slidebox_icon = slidebox_icon;
        this.handler = handler;

        this._slidedown_height = 0;
        this._anim = null;
        this._dragged_down = false;

        this.hammertime = Hammer(this.container)
          .on("touch dragdown release", function(ev) {
              self.handleHammer(ev);
          });
    };


      /**
       * Handle HammerJS callback
       * @param ev
       */
      Main.prototype.handleHammer = function(ev) {
          var self = this;

          switch(ev.type) {
              // reset element on start
              case 'touch':
                  this.hide();
                  break;

              // on release we check how far we dragged
              case 'release':
                  if(!this._dragged_down) {
                      return;
                  }

                  // cancel animation
                  cancelAnimationFrame(this._anim);

                  // over the breakpoint, trigger the callback
                  if(ev.gesture.deltaY >= this.breakpoint) {
                      container_el.className = 'pullrefresh-loading';
                      pullrefresh_icon_el.className = 'icon loading';

                      this.setHeight(60);
                      this.handler.call(this);
                  }
                  // just hide it
                  else {
                      pullrefresh_el.className = 'slideup';
                      container_el.className = 'pullrefresh-slideup';

                      this.hide();
                  }
                  break;

              // when we dragdown
              case 'dragdown':
                  this._dragged_down = true;

                  // if we are not at the top move down
                  var scrollY = window.scrollY;
                  if(scrollY > 5) {
                      return;
                  } else if(scrollY !== 0) {
                      window.scrollTo(0,0);
                  }

                  // no requestAnimationFrame instance is running, start one
                  if(!this._anim) {
                      this.updateHeight();
                  }

                  // stop browser scrolling
                  ev.gesture.preventDefault();

                  // update slidedown height
                  // it will be updated when requestAnimationFrame is called
                  this._slidedown_height = ev.gesture.deltaY * 0.4;
                  break;
          }
      };


      /**
       * when we set the height, we just change the container y
       * @param   {Number}    height
       */
      Main.prototype.setHeight = function(height) {
          if(Modernizr.csstransforms3d) {
              this.container.style.transform = 'translate3d(0,'+height+'px,0) ';
              this.container.style.oTransform = 'translate3d(0,'+height+'px,0)';
              this.container.style.msTransform = 'translate3d(0,'+height+'px,0)';
              this.container.style.mozTransform = 'translate3d(0,'+height+'px,0)';
              this.container.style.webkitTransform = 'translate3d(0,'+height+'px,0) scale3d(1,1,1)';
          }
          else if(Modernizr.csstransforms) {
              this.container.style.transform = 'translate(0,'+height+'px) ';
              this.container.style.oTransform = 'translate(0,'+height+'px)';
              this.container.style.msTransform = 'translate(0,'+height+'px)';
              this.container.style.mozTransform = 'translate(0,'+height+'px)';
              this.container.style.webkitTransform = 'translate(0,'+height+'px)';
          }
          else {
              this.container.style.top = height+"px";
          }
      };


      /**
       * hide the pullrefresh message and reset the vars
       */
      Main.prototype.hide = function() {
          container_el.className = '';
          this._slidedown_height = 0;
          this.setHeight(0);
          cancelAnimationFrame(this._anim);
          this._anim = null;
          this._dragged_down = false;
      };


      /**
       * hide the pullrefresh message and reset the vars
       */
      Main.prototype.slideUp = function() {
          var self = this;
          cancelAnimationFrame(this._anim);

          pullrefresh_el.className = 'slideup';
          container_el.className = 'pullrefresh-slideup';

          this.setHeight(0);

          setTimeout(function() {
              self.hide();
          }, 500);
      };


      /**
       * update the height of the slidedown message
       */
      Main.prototype.updateHeight = function() {
          var self = this;

          this.setHeight(this._slidedown_height);

          if(this._slidedown_height >= this.breakpoint){
              this.slidebox.className = 'breakpoint';
              this.slidebox_icon.className = 'icon arrow arrow-up';
          }
          else {
              this.slidebox.className = '';
              this.slidebox_icon.className = 'icon arrow';
          }

          this._anim = requestAnimationFrame(function() {
              self.updateHeight();
          });
      };

      return Main;
    })();



    function getEl(id) {
        return document.getElementById(id);
    }

    var container_el = $('#container')[0];
    var pullrefresh_el = $('#pullrefresh')[0];
    var pullrefresh_icon_el = $('#pullrefresh-icon')[0];
    var image_el = $('#random-image')[0];
    console.log('containerel', container_el);

    var refresh = new PullToRefresh(container_el, pullrefresh_el, pullrefresh_icon_el);

    // update image onrefresh
    refresh.handler = function() {
      var self = this;
      $scope.$apply(function(){
        $scope.getMessages();
      });
      console.log('Hammer time!');
      setTimeout(function(){
        self.slideUp();
      }, 1000);
    };
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
    var url = oaktreeUrl +'message/retrieve/' + userService.currentUser._id.toString();
    $http.get(url).success(function(res, status, headers){
      userService.setReceivedMessages(res.inbox);
      userService.setSentMessages(res.outbox);
      $scope.initialize();
    }).error(function(u, getRes){
      console.log('failed to get messages', u, getRes);
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

var TutorialCtrl = function($scope) {

  $scope.roundandround = function() {
    function Carousel(element) {
      var self = this;
      element = $(element);

      var container = $(">ul", element);
      var panes = $(">ul>li", element);

      var pane_width = 0;
      var pane_count = panes.length;

      var current_pane = 0;


      /**
       * initial
       */
      this.init = function() {
          setPaneDimensions();

          $(window).on("load resize orientationchange", function() {
              setPaneDimensions();
              //updateOffset();
          });
      };


      /**
       * set the pane dimensions and scale the container
       */
      function setPaneDimensions() {
          pane_width = element.width();
          panes.each(function() {
              $(this).width(pane_width);
          });
          container.width(pane_width*pane_count);
      }


      /**
       * show pane by index
       * @param   {Number}    index
       */
      this.showPane = function( index ) {
          // between the bounds
          index = Math.max(0, Math.min(index, pane_count-1));
          current_pane = index;

          var offset = -((100/pane_count)*current_pane);
          setContainerOffset(offset, true);
      };


      function setContainerOffset(percent, animate) {
          container.removeClass("animate");

          if(animate) {
              container.addClass("animate");
          }

          if(Modernizr.csstransforms3d) {
              container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
          }
          else if(Modernizr.csstransforms) {
              container.css("transform", "translate("+ percent +"%,0)");
          }
          else {
              var px = ((pane_width*pane_count) / 100) * percent;
              container.css("left", px+"px");
          }
      }

      this.next = function() { return this.showPane(current_pane+1, true); };
      this.prev = function() { return this.showPane(current_pane-1, true); };



      function handleHammer(ev) {
        console.log(ev);
        // disable browser scrolling
        ev.gesture.preventDefault();

        switch(ev.type) {
          case 'dragright':
          case 'dragleft':
            // stick to the finger
            var pane_offset = -(100/pane_count)*current_pane;
            var drag_offset = ((100/pane_width)*ev.gesture.deltaX) / pane_count;

            // slow down at the first and last pane
            if((current_pane === 0 && ev.gesture.direction === Hammer.DIRECTION_RIGHT) ||
              (current_pane === pane_count-1 && ev.gesture.direction === Hammer.DIRECTION_LEFT)) {
              drag_offset *= 0.4;
            }

            setContainerOffset(drag_offset + pane_offset);
            break;

          case 'swipeleft':
            self.next();
            ev.gesture.stopDetect();
            break;

          case 'swiperight':
            self.prev();
            ev.gesture.stopDetect();
            break;

          case 'release':
            // more then 50% moved, navigate
            if(Math.abs(ev.gesture.deltaX) > pane_width/2) {
              if(ev.gesture.direction == 'right') {
                self.prev();
              } else {
                self.next();
              }
            }
            else {
              self.showPane(current_pane, true);
            }
            break;
        }
      }

      element.hammer({ drag_lock_to_axis: true })
        .on("release dragleft dragright swipeleft swiperight", handleHammer);
    }

    setTimeout(function(){
      var carousel = new Carousel("#carousel");
      carousel.init();
    }, 200);
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
  $scope.touch = function(){
    $scope.text = 'touched';
  };
};
