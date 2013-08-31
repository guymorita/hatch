'use strict';

var SettingsCtrl = function($scope, userService, $http) {
  $scope.username = userService.currentUser.username;
  $scope.phone = userService.currentUser.phone;
};