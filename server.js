var io = require('socket.io').listen(8000);
var connections = [];

io.sockets.on('connection', function(socket) {
	console.log("connection received");

	connections.push(socket);

	var connectionsId = [];

	for (var i = 0, len = connections.length; i < len; i++) {
		var id = connections[i].id

		if (id != socket.id) {
			connectionsId.push(id);
		}
	}

	socket.emit('connections', {
		connections: connectionsId
	});

	socket.on('disconnect', function() {
		console.log("disconnect received");
		for (var i = 0; i < connections.length; i++) {
			var id = connections[i].id;

			if (id == socket.id) {
				connections.splice(i, 1);
				i--;
			}
		}
	});

	socket.on('ice candidate', function(socketId, data) {
		console.log("ice candidate received");

		var soc = getSocket(socketId);

		if (soc) {
			soc.emit('receive ice candidate', {
				data: data,
				socketId: socketId
			});
		}
	});

	socket.on('send offer', function(socketId, data) {
		console.log("offer received");

		var soc = getSocket(socketId);

		if (soc) {
			soc.emit('receive offer', {
				data: data,
				socketId: socketId
			});
		}
	});

	socket.on('send answer', function(socketId, data) {
		console.log("answer received");

		var soc = getSocket(socketId);

		if (soc) {
			soc.emit('receive answer', {
				data: data,
				socketId: socketId
			});
		}
	});

});


function getSocket(id) {

	for (var i = 0; i < connections.length; i++) {

		var socket = connections[i];

		if (id == socket.id) {
			return socket;
		}
	}
}