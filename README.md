# RTC.io

An abstraction layer for webRTC. Aim is to simplify the HTML5 web standard webRTC in a similar manner to socket.io w/ websockets.

## Installation

```bash
$ npm install webrtc.io
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
