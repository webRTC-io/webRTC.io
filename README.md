# webRTC.io

An abstraction layer for webRTC. Aim is to simplify the HTML5 web standard webRTC in a similar manner to socket.io w/ websockets. This project is still in an infintile stage, please send feature requests (or pulls!) to us as well as bug reports.

## What is webRTC?
webRTC is a new webstandard being developed for peer-to-peer communication on the web. This means that browsers will be able to send information, without sending information through the server. Server side this will reduce load dramatically. 

Currently the webRTC standard is very focused on the video & audio aspects of the project. In the future (hopefully near future!) they will begin implementing the data channel, which will allow arbitrary data to be sent peer-to-peer. For now the webRTC team is focused on stabalizing and optimizing the video and audio channels.

Unfortunately, a server (or two) will still be required for two reasons, The media for the page must be initially supplied, and the server, in conjunction with a [STUN server](http://en.wikipedia.org/wiki/STUN) (abstracted away by the webRTC.io library), is required to synchronize the connections.

## Browser Support
webRTC is supported in very few browsers. We recommend either chrome from either the dev channel or the canary release.
After installation, go to [About://flags](chrome://flags/). Enable
```
Enable Media Source API on <video> elements. (this may be unnecessary)
Enable MediaStream (this may be unnecessary)
Enable PeerConnection
```

## Demo
This is a multi-person chat room demo written using our webRTC.io library. [Example Site](http://multiwebrtc.nodejitsu.com) & [Repository](http://www.github.com/dennismartensson/webrtc.io-demo/) (browser support section still applies!)

## Installation
```bash
 npm install webrtc.io
 npm install socket.io
```
(from here you can clone the demo repo and use the demo, use the example code, or write your own webRTC app!)

the demo site requires express as well
```bash
 npm install express
```
for absurdly detailed instruction on setting up the demo, go to the demo repo.
## Example code

### Client


```html
<video id="local" autoplay></video>
<script src="/socket.io/socket.io.js"></script>
<script src="/webrtc.io/webrtc.io.js"></script>
<script>
  rtc.createStream('local');
  rtc.connect('http://yourserveraddress');
  rtc.on('ready', function() {
    // all streams are loaded
  });
</script>
```

### Server

```javascript
var io = require('webrtc.io').listen(8000);
// this is a simple wrapper around socket.io, so you can define your own events
// like so:
io.sockets.on('connection', function(socket) {
  socket.on('chat', function(nick, message) {
    socket.broadcast.emit('chat', nick, message);
  });
});
```

## Stumped?
```
#webrtc.io on freenode
```

```
We've done house calls in the past (also known as walking down the hall)... we'll totally do it again if you fly us out!
```
