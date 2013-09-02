'use strict';

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
    var url = userService.oaktreeUrl +'message/retrieve/' + userService.currentUser._id.toString();
    $http.get(url).success(function(res, status){
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
    }).error(function(res, status){
      console.log('error getting messages', res, status);
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
      setTimeout(function(){
        self.slideUp();
      }, 1000);
    };
  };

};