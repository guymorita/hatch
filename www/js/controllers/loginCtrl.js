'use strict';

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
    $http.post(userService.oaktreeUrl +'user/'+ fetchRoute, JSON.stringify(userObject))
            .success(function(userResponse, status){
              userService.setUser(userResponse);
              var usePass = userObject.username+":"+userObject.password;
              window.localStorage.setItem("powuseee", usePass);
              $http.get(userService.oaktreeUrl +'user/')
                .success(function(users, status2){
                  userService.setAllUsers(users);
                });
              if(app.userToken){
                $http.get(userService.oaktreeUrl + 'user/token/'+userResponse._id+'/'+app.userToken)
                  .success(function(userResponse, status3){
                  });
              }
              $scope.slidePage('/tutorial');
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
