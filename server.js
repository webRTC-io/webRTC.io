var io = require('socket.io').listen(8001);
var connections = [];
var colors = {};

io.sockets.on('connection', function(socket) {
	console.log("connection received");
	connections.push(socket);
        colors[socket.id] = Math.floor(Math.random()* 0xFFFFFF)

	var connectionsId = [];

	for (var i = 0, len = connections.length; i < len; i++) {
		var id = connections[i].id;

		if (id !== socket.id) {
			connectionsId.push(id);
		}
	}

	socket.emit('get peers', {
		connections: connectionsId
	});

	socket.broadcast.emit('new peer connected', { socketId: socket.id });

	socket.on('disconnect', function() {

		console.log("*******************************disconnect received");
		for (var i = 0; i < connections.length; i++) {
			var id = connections[i].id;

			if (id == socket.id) {
				connections.splice(i, 1);
				i--;
				socket.broadcast.emit('remove peer connected', { socketId: socket.id });
			}
		}
	});

	socket.on('receive ice candidate', function(data) {
		console.log("ice candidate received");

		var soc = getSocket(data.socketId);

		if (soc) {
			soc.emit('receive ice candidate', {
				label: data.label,
				candidate: data.candidate,
				socketId: socket.id
			});
		}
	});

	socket.on('send offer', function(data) {
		console.log("offer received");

		var soc = getSocket(data.socketId);

		if (soc) {
			soc.emit('receive offer', {
				sdp: data.sdp,
				socketId: socket.id
			});
		}
	});

	socket.on('send answer', function(data) {
		console.log("answer received");

		var soc = getSocket(data.socketId);

		if (soc) {
			soc.emit('receive answer', {
				sdp: data.sdp,
				socketId: socket.id
			});
		}
	});


	socket.on('chat msg', function(msg) {
		console.log("chat received");
		
		socket.broadcast.emit('receive chat msg', { msg: msg, color: colors[socket.id]});
	});

});


function getSocket(id) {
	for (var i = 0; i < connections.length; i++) {
		var socket = connections[i];
		if (id === socket.id) {
			return socket;
		}
	}
}
