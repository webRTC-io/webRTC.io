var rtc = require('../lib/webrtc.io')
rtc.listen(8001);

rtc.on('connection', function() {
  console.log("connection received");
});

