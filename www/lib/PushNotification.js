
//
//  PushNotification.js
//
// Created by Olivier Louvignes on 06/05/12.
// Inspired by Urban Airship Inc orphaned PushNotification phonegap plugin.
//
// Copyright 2012 Olivier Louvignes. All rights reserved.
// MIT Licensed

(function(cordova) {

    function PushNotification() {}

    // Call this to register for push notifications and retreive a deviceToken
    PushNotification.prototype.registerDevice = function(config, callback) {
        console.log(">>Plugin JS - registerDevice");
        cordova.exec(callback, callback, "PushNotification", "registerDevice", config ? [config] : []);
    };

    // Call this to retreive pending notification received while the application is in background or at launch
    PushNotification.prototype.getPendingNotifications = function(callback) {
        cordova.exec(callback, callback, "PushNotification", "getPendingNotifications", []);
    };

    // Call this to get a detailed status of remoteNotifications
    PushNotification.prototype.getRemoteNotificationStatus = function(callback) {
        //console.log("Calling to get remote notification status");
        cordova.exec(callback, callback, "PushNotification", "getRemoteNotificationStatus", []);
    };

    // Call this to set the application icon badge
    PushNotification.prototype.setApplicationIconBadgeNumber = function(badge, callback) {
        cordova.exec(callback, callback, "PushNotification", "setApplicationIconBadgeNumber", [{badge: badge}]);
    };

    // Call this to clear all notifications from the notification center
    PushNotification.prototype.cancelAllLocalNotifications = function(callback) {
        cordova.exec(callback, callback, "PushNotification", "cancelAllLocalNotifications", []);
    };

    // Call this to retreive the original device unique id
    // @warning As of today, usage is deprecated and requires explicit consent from the user
    PushNotification.prototype.getDeviceUniqueIdentifier = function(callback) {
        cordova.exec(callback, callback, "PushNotification", "getDeviceUniqueIdentifier", []);
    };

    // Event spawned when a notification is received while the application is active
    PushNotification.prototype.notificationCallback = function(notification) {
        var ev = document.createEvent('HTMLEvents');
        ev.notification = notification;
        ev.initEvent('push-notification', true, true, arguments);
        document.dispatchEvent(ev);
    };

    cordova.addConstructor(function() {
        if(!window.plugins) window.plugins = {};
        window.plugins.pushNotification = new PushNotification();
    });

})(window.cordova || window.Cordova || window.PhoneGap);

// var PushNotification = function() {
// };


// // Call this to register for push notifications. Content of [options] depends on whether we are working with APNS (iOS) or GCM (Android)
// PushNotification.prototype.register = function(successCallback, errorCallback, options) {
//     if (errorCallback == null) { errorCallback = function() {}}

//     if (typeof errorCallback != "function")  {
//         console.log("PushNotification.register failure: failure parameter not a function");
//         return
//     }

//     if (typeof successCallback != "function") {
//         console.log("PushNotification.register failure: success callback parameter must be a function");
//         return
//     }

// 	cordova.exec(successCallback, errorCallback, "PushPlugin", "register", [options]);
// };

// // Call this to unregister for push notifications
// PushNotification.prototype.unregister = function(successCallback, errorCallback) {
//     if (errorCallback == null) { errorCallback = function() {}}

//     if (typeof errorCallback != "function")  {
//         console.log("PushNotification.unregister failure: failure parameter not a function");
//         return
//     }

//     if (typeof successCallback != "function") {
//         console.log("PushNotification.unregister failure: success callback parameter must be a function");
//         return
//     }

//      cordova.exec(successCallback, errorCallback, "PushPlugin", "unregister", []);
// };


// // Call this to set the application icon badge
// PushNotification.prototype.setApplicationIconBadgeNumber = function(successCallback, errorCallback, badge) {
//     if (errorCallback == null) { errorCallback = function() {}}

//     if (typeof errorCallback != "function")  {
//         console.log("PushNotification.setApplicationIconBadgeNumber failure: failure parameter not a function");
//         return
//     }

//     if (typeof successCallback != "function") {
//         console.log("PushNotification.setApplicationIconBadgeNumber failure: success callback parameter must be a function");
//         return
//     }

//     cordova.exec(successCallback, successCallback, "PushPlugin", "setApplicationIconBadgeNumber", [{badge: badge}]);
// };

// //-------------------------------------------------------------------

// if(!window.plugins) {
//     window.plugins = {};
// }
// if (!window.plugins.pushNotification) {
//     window.plugins.pushNotification = new PushNotification();
// }
