RTC.io
=========

An abstraction layer for webRTC. Aim is to simplify the HTML5 web standard webRTC in a similar manner to socket.io w/ websockets.

Client
```html
<script src="/rtc.io/rtc.io.js"></script>
<script>
    server = rtc.sync(server, [video1]);
    rtc.onSync(console.log('Connected to server' );
    rtc.onConnect('initialize video screen for stream');
</script>
```

Server
```javascript
```
