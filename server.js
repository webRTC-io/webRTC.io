var io = require('socket.io').listen(8001);
var connections = [];

io.sockets.on('connection', function(socket) {
	console.log("connection received");

	connections.push(socket);

	var connectionsId = [];

	for (var i = 0, len = connections.length; i < len; i++) {
		var id = connections[i].id;

		if (id !== socket.id) {
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

	socket.on('receive ice candidate', function(data) {
		console.log("ice candidate received");

	  socket.broadcast.emit('receive ice candidate', {
      label: data.label,
      candidate: data.candidate
    });
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
				data: data,
        socketId: socket.id
			});
		}
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
