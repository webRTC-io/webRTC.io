var io = require('socket.io').listen(8000);
var rtc = require('./rtc');

io.sockets.on('sync', function (socket, Peer) {
	rtc.addPeer(Peer);

	if(rtc.getPeers()){
		socket.emit('add peers', { peers: rtc.getPeers()});
	}
});

io.sockets.on('onSyncEnd', function (socket, Peer) {
	rtc.removePeer(Peer);
});