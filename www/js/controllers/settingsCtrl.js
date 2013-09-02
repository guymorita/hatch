'use strict';

var SettingsCtrl = function($scope, userService, $http) {
  $scope.username = userService.currentUser.username;
  $scope.phone = userService.currentUser.phone;
  console.log('userService', userService.currentUser);
  if (userService.currentUser.confirm_code !== 1){
    $scope.confirmCode = true;
  }
  $scope.codez = '';
  $scope.logOut = function(path, type){
    window.localStorage.setItem("powuseee", "");
    navSvc.slidePage(path, type);
  };
  $scope.clear = function(){
    $http.get(userService.oaktreeUrl+'message/clear/'+userService.currentUser._id)
      .success(function(response, status){
        $scope.cleared = true;
      }).error(function(response, status){
      });
  };
  $scope.clearClass = function(){
    if ($scope.cleared){
      return 'pure-button-disabled';
    }
  };
  $scope.confirm = function(){
    $http.get(userService.oaktreeUrl+'user/confirm/'+userService.currentUser._id+'/'+$scope.codez)
      .success(function(response, status){
      }).error(function(response, status){
      });
  };
  $scope.resend = function(){
    $http.get(userService.oaktreeUrl+'user/resend/'+userService.currentUser._id)
      .success(function(response, status){
      }).error(function(response, status){
      });
  }
};