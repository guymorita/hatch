# Hatch #
A geo-fencing based social app where users can 'leave' notes for their friends at specified locations. Those friends will receive a push notification informing them of the note's title and location, but must then go there in order to retrieve the rest of the content. Users can also leave surprise notes, in which case their friends will not receive a notification until they are at the specified location.

The server for this app is located [here]("https://github.com/guymorita/oatreee").

# reminder to add screenshots #

## Tech Stack ##
* AngularJS
* PhoneGap
* HammerJS
* PushNotification
* Google Maps
* MomentJS
* Modernizr
* Twilio
* UnderscoreJS
* jQuery

Hatch is written fully in JavaScript. The views are built using AngularJS, which dynamically manipulates the dom, allowing for the responsiveness of this application. We utilize the PhoneGap development framework to gain access to the mobile OS and expose native functionality such as camera, contacts, and geolocation for the core functionality of the app. It also bridges the HTML, CSS, and JavaScript with the mobile device in order to create a native app.