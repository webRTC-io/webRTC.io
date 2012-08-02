var io = require('socket.io');

var connections = module.exports.connections = [];

module.exports.listen = function() {
  // delegate all arguments to socket.io.listen
  var manager = io.listen.apply(io, arguments);

  manager.sockets.on('connection', function(socket) {
    // add socket to list of connections
    connections.push(socket);

    // pass array of connection ids except for peer's to peer
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

    // tell everyone else about the new peer
    socket.broadcast.emit('new peer connected', { socketId: socket.id });

    // remove connection from array and tell everyone else about the
    // disconnect
    socket.on('disconnect', function() {
      for (var i = 0; i < connections.length; i++) {
        var id = connections[i].id;

        if (id == socket.id) {
          connections.splice(i, 1);
          i--;
          socket.broadcast.emit('remove peer connected', {
            socketId: socket.id
          });
        }
      }
    });

    socket.on('receive ice candidate', function(data) {
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
      var soc = getSocket(data.socketId);

      if (soc) {
        soc.emit('receive offer', {
          sdp: data.sdp,
          socketId: socket.id
        });
      }
    });

    socket.on('send answer', function(data) {
      var soc = getSocket(data.socketId);

      if (soc) {
        soc.emit('receive answer', {
          sdp: data.sdp,
          socketId: socket.id
        });
      }
    });

  });

  return manager;
}

function getSocket(id) {
  for (var i = 0; i < connections.length; i++) {
    var socket = connections[i];
    if (id === socket.id) {
      return socket;
    }
  }
}
