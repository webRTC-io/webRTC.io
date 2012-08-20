# webrtc.io

A library that is to webRTC like socket.io is to WebSockets.

This will eventually be bundled with the [server code](https://github.com/cavedweller/webRTC.io).

## Installation

Currently, webrtc.io depends on socket.io, so include the socket.io client as well. After including socket.io-client, drop in `lib/io.js`. You'll also need a webrtc.io server running.

Now you can start using webRTC commands with our abstraction.


## Usage

```javascript
rtc.createStream({"video": true, "audio":true}, function(stream){
  // get local stream for manipulation
}
rtc.connect('ws://yourserveraddress:8001', optionalRoom);
//then a bunch of callbacks are available
```

You can set the STUN server by calling 
rtc.SERVER = "STUN stun.l.google.com:19302" and set your server. The default STUN server used by the library is one from google.
