var io = require('socket.io').listen(8000);

io.sockets.on('onSync', function (socket, Peer) {
	rtc.addPeer(Peer);

	if(rtc.getPeers()){
		socket.emit('addPeers', { peers: rtc.getPeers()});
	}
});

io.sockets.on('onSyncEnd', function (socket, Peer) {
	rtc.removePeer(Peer);x
});