'use strict';

/* Services */

// Simple value service.
angular.module('myApp.services', []).
  value('version', '0.1');

// phonegap ready service - listens to deviceready

myApp.factory('userService', function(){
    return {
        currentUser: null,
        setUser: function(userObject){
          this.currentUser = userObject;
        },
        allUsers: null,
        setAllUsers: function(usersArray){
          this.allUsers = usersArray;
        },
        allMessages: null,
        setMessages: function(messagesArray){
            this.allMessages = messagesArray;
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
    }
  };
});

myApp.factory('imageService', function(){
    return {
     image: {},
     set: function(field, value){
      this.image[field] = value;
    }
  };
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


