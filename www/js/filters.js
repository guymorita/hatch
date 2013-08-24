'use strict';

/* Filters */
angular.module('myApp.filters', [])
  .filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }])
  .filter('momenttime', function(){
    return function(input){
        return moment(input).utc().local().fromNow();
    }
  })
  .filter('distmeters', function(){
    return function(distance){
      return distance.toString().split('.')[0]+' meters';
    }
  });
