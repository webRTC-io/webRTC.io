var io = require('socket.io').listen(8000);
var rtc = require('./rtc');


//SYNC KEEP TRACK OF PEERS
io.sockets.on('sync', function(socket, peer) {
	console.log("sync received");

	rtc.addPeer(socket, peer);

	var peers = rtc.getPeers();
	
	if (peers) {
		socket.emit('add peers', {
			peers: peers
		});
	}
});

io.sockets.on('sync end', function(socket) {
	rtc.removePeer(socket);
});


//CONNECT PEERS
socket.on('ice candidate', function(data) {
	console.log("ice candidate received");
	socket.broadcast.emit('receive ice candidate', data);
});

socket.on('send offer', function(data) {
	console.log("offer received");
	socket.broadcast.emit('receive offer', data);
});

socket.on('send answer', function(data) {
	console.log("answer received");
	socket.broadcast.emit('receive answer', data);
});


//CONNECT PEER
socket.on('ice candidate peer', function(data, peer) {
	console.log("ice candidate received");

	var peerSocket = rtc.getSocketFromPeer(peer);

	peerSocket.emit('receive ice candidate', data);
});

socket.on('send offer peer', function(data, peer) {
	console.log("offer received");

	var peerSocket = rtc.getSocketFromPeer(peer);
	peerSocket.emit('receive offer', data);
});

socket.on('send answer peer', function(data, peer) {
	console.log("answer received");

	var peerSocket = rtc.getSocketFromPeer(peer);
	peerSocket.emit('receive answer', data);
});

