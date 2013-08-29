'use strict';


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives','ajoslin.mobile-navigate','ngMobile', 'shoppinpal.mobile-menu', 'google-maps', 'hmTouchEvents'])
    .config(function ($compileProvider){
        $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    })
    .config(['$httpProvider', function($httpProvider){
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.post['Content-Type'] =
            // 'application/x-www-form-urlencoded';
            'application/json';
    }])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {templateUrl: 'partials/loginView.html', controller: 'HomeCtrl'});
        $routeProvider.when('/contactSearchView', {templateUrl: 'partials/contactSearchView.html', controller: 'ContactsCtrl'});

        $routeProvider.when('/signup', {templateUrl: 'partials/signUpView.html', controller: 'HomeCtrl'});
        $routeProvider.when('/tutorial', {templateUrl: 'partials/tutorialView.html', controller: 'HomeCtrl'});
        $routeProvider.when('/auth', {templateUrl: 'partials/authView.html', controller: 'HomeCtrl'});

        $routeProvider.when('/newmessage', {templateUrl: 'partials/newMessageView.html', controller: 'HomeCtrl'});
        $routeProvider.when('/messageRead', {templateUrl: 'partials/messageReadView.html', controller: 'HomeCtrl'});

        $routeProvider.when('/map', {templateUrl: 'partials/mapView.html', controller: 'showPinsCtrl'});
        $routeProvider.when('/pinmap', {templateUrl: 'partials/pinMapView.html', controller: 'newPinCtrl'});

        $routeProvider.when('/home', {templateUrl: 'partials/homeView.html', controller: 'HomeCtrl'});
        $routeProvider.when('/inbox', {templateUrl: 'partials/inboxView.html', controller: 'HomeCtrl'});
        $routeProvider.when('/view2', {templateUrl: 'partials/geolocationView.html', controller: 'GeolocationCtrl'});

        $routeProvider.when('/friends', {templateUrl: 'partials/friendsView.html', controller: 'FriendsListCtrl'});
        $routeProvider.when('/friendSend', {templateUrl: 'partials/friendSendView.html', controller: 'FriendsListCtrl'});
        $routeProvider.when('/allUsers', {templateUrl: 'partials/allUsersView.html', controller: 'ContactsCtrl'});
        $routeProvider.when('/test', {templateUrl: 'partials/testView.html', controller: 'TestCtrl'});
        $routeProvider.when('/newnav', {templateUrl: 'partials/newNavView.html', controller: 'HomeCtrl'});

        $routeProvider.when('/hammertest', {templateUrl: 'partials/pullRefresh.html', controller: 'HammerTestCtrl'});
        $routeProvider.otherwise({redirectTo: '/login'});
  }]);
