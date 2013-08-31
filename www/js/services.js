'use strict';

/* Services */

// Simple value service.
angular.module('myApp.services', []).
  value('version', '0.1');

// phonegap ready service - listens to deviceready

myApp.factory('userService', function($http){
    return {
        oaktreeUrl: 'http://oaktree.nodejitsu.com/',
        currentUser: null,
        setUser: function(userObject){
          this.currentUser = userObject;
        },
        allUsers: null,
        setAllUsers: function(usersArray){
          this.allUsers = usersArray;
        },
        setSentMessages: function(messagesArray){
            this.sentMessages = messagesArray;
        },
        setReceivedMessages: function(messagesArray){
            this.receivedMessages = messagesArray;
        },
        currentRead: null,
        setCurrentRead: function(message){
            this.currentRead = message;
        },
        friendObj: {},
        buildFriendLookup: function(){
            var that = this;
            _.each(this.currentUser.friends, function(userObj, index){
                that.friendObj[userObj._id] = userObj.username;
            });
        },
        allMessages: null,
        pullMessages: function(cb){
            $http.get(this.oaktreeUrl + 'message/retrieve/'+this.currentUser._id)
                .success(function(u, getRes){
                    this.setReceivedMessages(u.inbox);
                    this.setSentMessages(u.outbox);
                    cb();
                })
                .error(function(err, otherRes){
                    console.log(err);
                })
        },
        getUserObj: function(cb){
          var userPass = window.localStorage.getItem("powuseee");
          console.log('userpass service', userPass);
          var username = userPass.split(':')[0];
          var password = userPass.split(':')[1];
          var that = this;
          $http.get(this.oaktreeUrl + 'user/login/' + username +'/'+ password)
            .success(function(u, getRes, headers){
              that.setUser(u);
              console.log('got user obj', u);
              cb();
            })
            .error(function(err, getRes){
              console.log('Error', err);
            });
        }
    };
});

myApp.factory('changePageService', function(){
    console.log('service')
});

myApp.factory('hatchService', function(){
    return {
      hatchObject: {},
      set: function(field, value){
        this.hatchObject[field] = value;
      },
      clear: function(){
        for (var key in this.hatchObject) {
            this.hatchObject[key] = null;
        }
      }
    };
});

myApp.factory('imageService', function(){
    return {
       photo: {},
       set: function(field, value){
        this.photo[field] = value;
       },
       clear: function(){
          for (var key in this.photo){
            delete this.photo[key];
          }
       }
    };
});

myApp.factory('locationService', function(){
    return {
     set: function(field, value){
      this.position = value;
    }
  };
});

myApp.factory('messageService', function($http){
    return {
        getMessages: function(userId){

        }
    }
})

myApp.factory('mapService', function(){
  return {
    saveMapState: function(map, mapName) {
        var mapZoom = map.getZoom();
        var mapCenter = map.getCenter();
        var mapLat = mapCenter.lat();
        var mapLng = mapCenter.lng();
        var cookiestring = mapLat + "_" + mapLng + "_" + mapZoom;
        this.setCookie(mapName,cookiestring, 30);
    },

    loadMapState: function(map, mapName) {
        var gotCookieString = this.getCookie(mapName);
        var splitStr = gotCookieString.split("_");
        var savedMapLat = parseFloat(splitStr[0]);
        var savedMapLng = parseFloat(splitStr[1]);
        var savedMapZoom = parseFloat(splitStr[2]);
        if ((!isNaN(savedMapLat)) && (!isNaN(savedMapLng)) && (!isNaN(savedMapZoom))) {
            map.setCenter(new google.maps.LatLng(savedMapLat,savedMapLng));
            map.setZoom(savedMapZoom);
        }
    },

    setCookie: function(c_name,value,exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays === null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    },

    getCookie: function(c_name) {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++)
        {
          x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
          y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
          x = x.replace(/^\s+|\s+$/g,"");
          if (x === c_name)
            {
            return unescape(y);
            }
          }
        return "";
    }
  }
});

myApp.factory('phonegapReady', function() {
    return function (fn) {
        var queue = [];
        var impl = function () {
        queue.push(Array.prototype.slice.call(arguments));
    };

    document.addEventListener('deviceready', function () {
        queue.forEach(function (args) {
            fn.apply(this, args);
        });
        impl = fn;
    }, false);

    return function () {
        return impl.apply(this, arguments);
        };
    };
});

myApp.factory('geolocation', function ($rootScope, phonegapReady) {
  return {
    getCurrentPosition: function (onSuccess, onError, options) {
        navigator.geolocation.getCurrentPosition(function () {
               var that = this,
               args = arguments;

               if (onSuccess) {
                   $rootScope.$apply(function () {
                        onSuccess.apply(that, args);
                   });
                   }
               }, function () {
                    var that = this,
                    args = arguments;

                   if (onError) {
                        $rootScope.$apply(function () {
                            onError.apply(that, args);
                        });
                   }
               },
            options);
        }
    };
});

myApp.factory('accelerometer', function ($rootScope, phonegapReady) {
    return {
        getCurrentAcceleration: phonegapReady(function (onSuccess, onError) {
            navigator.accelerometer.getCurrentAcceleration(function () {
                var that = this,
                    args = arguments;

                if (onSuccess) {
                    $rootScope.$apply(function () {
                        onSuccess.apply(that, args);
                    });
                }
            }, function () {
                var that = this,
                args = arguments;

                if (onError) {
                    $rootScope.$apply(function () {
                        onError.apply(that, args);
                    });
                }
            });
        })
    };
});

myApp.factory('notification', function ($rootScope, phonegapReady) {
    return {
        alert: phonegapReady(function (message, alertCallback, title, buttonName) {
            navigator.notification.alert(message, function () {
                var that = this,
                    args = arguments;

                $rootScope.$apply(function () {
                    alertCallback.apply(that, args);
                });
            }, title, buttonName);
        }),
        confirm: phonegapReady(function (message, confirmCallback, title, buttonLabels) {
            navigator.notification.confirm(message, function () {
                var that = this,
                    args = arguments;

                $rootScope.$apply(function () {
                    confirmCallback.apply(that, args);
                });
            }, title, buttonLabels);
        }),
        beep: function (times) {
            navigator.notification.beep(times);
        },
        vibrate: function (milliseconds) {
            navigator.notification.vibrate(milliseconds);
        }
    };
});

myApp.factory('navSvc', function($navigate) {
    return {
        slidePage: function (path,type) {
            $navigate.go(path);
        },
        back: function () {
            $navigate.back();
        }
    }
});

myApp.factory('compass', function ($rootScope, phonegapReady) {
    return {
        getCurrentHeading: phonegapReady(function (onSuccess, onError) {
            navigator.compass.getCurrentHeading(function () {
                var that = this,
                    args = arguments;

                if (onSuccess) {
                    $rootScope.$apply(function () {
                        onSuccess.apply(that, args);
                    });
                }
            }, function () {
                var that = this,
                    args = arguments;

                if (onError) {
                    $rootScope.$apply(function () {
                        onError.apply(that, args);
                    });
                }
            });
        })
    };
});

myApp.factory('contacts', function ($rootScope, phonegapReady) {
    return {
        findContacts: phonegapReady(function (onSuccess, onError) {
            var options = new ContactFindOptions();
            options.filter="";
            options.multiple=true;
            var fields = ["displayName", "name"];
            navigator.contacts.find(fields, function(r){console.log("Success" +r.length);var that = this,
                args = arguments;
                if (onSuccess) {
                    $rootScope.$apply(function () {
                        onSuccess.apply(that, args);
                    });
                }
            }, function () {
                var that = this,
                    args = arguments;

                if (onError) {
                    $rootScope.$apply(function () {
                        onError.apply(that, args);
                    });
                }
            }, options)
        })
    }
});


