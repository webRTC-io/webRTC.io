var io = require('socket.io');
var client = require('webrtc.io-client');

// Used for callback publish and subscribe
var rtc = {};

// Holds callbacks for certain events.
rtc._events = {};

// Holds the rooms 
var rooms = {};

module.exports.listen = function() {
  // delegate all arguments to socket.io.listen
  var manager = io.listen.apply(io, arguments);

  attachRoutes(manager);
  attachEvents(manager);
  return manager;
};

rtc.on = function(eventName, callback) {
  rtc._events[eventName] = rtc._events[eventName] || [];
  rtc._events[eventName].push(callback);
};

rtc.fire = function(eventName, _) {
  var events = rtc._events[eventName];
  var args   = Array.prototype.slice.call(arguments, 1);

  if (!events) {
    return;
  }

  for (var i = 0, len = events.length; i < len; i++) {
    events[i].apply(null, args);
  }
};

function attachRoutes(manager) {
  var server = manager.server;
  var oldHandlers = server.listeners('request').splice(0);

  server.on('request', function(req, res) {
    if (req.url !== '/webrtc.io/webrtc.io.js') {
      // re-run old handlers
      for (var i = 0, len = oldHandlers.length; i < len; i++) {
        var handler = oldHandlers[i];
        handler.call(server, req, res);
        console.log(server);
      }
      return;
    }

    client.builder(function(err, content) {
      if (err) {
        console.error(err);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(req.method !== 'HEAD' && content ? content : '');
    });
  });
}

function attachEvents(manager) {
  manager.sockets.on('connection', function(socket) {
    // TODO: let you join multiple rooms
    socket.on('join room', function(room) {
      // initialize room as an empty array
      var connections = rooms[room] = rooms[room] || [];

      socket.join(room);

      // tell everyone else in the room about the new peer
      socket.broadcast.to(room)
        .emit('new peer connected', { socketId: socket.id });

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

      // remove connection from array and tell everyone else about the
      // disconnect
      socket.on('disconnect', function() {
        var connections = rooms[room];
        for (var i = 0; i < connections.length; i++) {
          var id = connections[i].id;

          if (id == socket.id) {
            connections.splice(i, 1);
            i--;
            socket.leave(room);
            socket.broadcast.to(room).emit('remove peer connected', {
              socketId: socket.id
            });
          }
        }
        rtc.fire('disconnect');
      });

      //Receive ice and send to the correct socket
      socket.on('receive ice candidate', function(data) {
        var soc = getSocket(room, data.socketId);

        if (soc) {
          soc.emit('receive ice candidate', {
            label: data.label,
            candidate: data.candidate,
            socketId: socket.id
          });
          rtc.fire('receive_ice_candidate');
        }
      });

      //Receive offer and send to correct socket
      socket.on('send offer', function(data) {
        var soc = getSocket(room, data.socketId);

        if (soc) {
          soc.emit('receive offer', {
            sdp: data.sdp,
            socketId: socket.id
          });
        }
        rtc.fire('send_offer');
      });

      //Receive answer and send to correct socket
      socket.on('send answer', function(data) {
        var soc = getSocket(room, data.socketId);

        if (soc) {
          soc.emit('receive answer', {
            sdp: data.sdp,
            socketId: socket.id
          });
          rtc.fire('send_answer');
        }
      });
    });
    rtc.fire('connection', rtc);
  });

  manager.rtc = rtc;
  return manager;
}

// Gets the socket from an id and room
function getSocket(room, id) {
  var connections = rooms[room];

  if (!connections) {
    // TODO: Or error, or customize
    return;
  }

  for (var i = 0; i < connections.length; i++) {
    var socket = connections[i];
    if (id === socket.id) {
      return socket;
    }
  }
}
