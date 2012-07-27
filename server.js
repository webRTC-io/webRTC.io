var io = require('socket.io').listen(8000);
//var rtc = require('./rtc');
var connections = [];

io.sockets.on('connection', function(socket) {
	console.log("connection received");

	if (!socket) {
		console.log("dafuq");
	}

	connections.push(socket);

	console.log(connections);

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
		if (connections.length > 0) {
			for (var i = 0; i < connections.length; i++) {
				var id = connections[i].id;

				if (id == socket.id) {
					connections.splice(i, 1);
					i--;
				}
			}

		}
	});

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

});