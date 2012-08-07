//SERVER
var webRTC = require('../lib/webrtc.io').listen(8000);

console.log('webRTC');
console.log(webRTC);

webRTC.rtc.on('connection', function(){
    console.log('connection');
});