# RTC.io

An abstraction layer for webRTC. Aim is to simplify the HTML5 web standard webRTC in a similar manner to socket.io w/ websockets. This project is still in an infintile stage, please send feature requests (or pulls!) to us as well as bug reports.

## What is webRTC?
webRTC is a new webstandard being developed for peer-to-peer communication on the web. This means that browsers will be able to send information, encrypted or not, without sending information through the server. Server side this will reduce load dramatically. 
Currently the webRTC standard is very focused on the video & audio aspects of the project. In the future (hopefully near future!) they will begin implementing the data channel, which will allow arbitrary data to be sent peer-to-peer. For now the webRTC team is focused on stabalizing and optimizing the video and audio channels.

## Installation

```bash
$ npm install webrtc.io
```

## Browser Support
webRTC is supported in very few browsers. We recommend either chrome frome either the dev channel or the canary release.
After installation, go to [About://flags](chrome://flags/). Enable
```
Enable Media Source API on <video> elements. (this may be unnecessary)
Enable MediaStream (this may be unnecessary)
Enable PeerConnection
```

## Client

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

## Server

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
