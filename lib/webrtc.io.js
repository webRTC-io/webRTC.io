//SERVER
var WebSocketServer = require('ws').Server

//Array to store connections
var sockets = [];

// Used for callback publish and subscribe
var rtc = {};

// Holds callbacks for certain events.
rtc._events = {};

// Holds the rooms 
var rooms = {};

rtc.on = function(eventName, callback) {
  rtc._events[eventName] = rtc._events[eventName] || [];
  rtc._events[eventName].push(callback);
};

rtc.fire = function(eventName, _) {
  var events = rtc._events[eventName];
  var args = Array.prototype.slice.call(arguments, 1);

  if (!events) {
    return;
  }

  for (var i = 0, len = events.length; i < len; i++) {
    events[i].apply(null, args);
  }
};

module.exports.listen = function(port) {
  var manager = new WebSocketServer({
    port: port
  });

  manager.rtc = rtc;
  attachEvents(manager);
  return manager;
};

function attachEvents(manager) {

  manager.on('connection', function(socket) {
    console.log('connection');
    //push to array for broadcast

    sockets.push(socket);
    console.log(sockets);

    socket.on('message', function(data) {
      console.log('message');
      var json = JSON.parse(data);
      rtc.fire(json.eventName, json);
    });

    // TODO: let you join multiple rooms
    rtc.on('join room', function(room) {
      console.log('join room');
      // initialize room as an empty array
      //var connections = rooms[room] = rooms[room] || [];

      var connections = sockets || [];

      //socket.join(room);

      connections.push(socket);

      // pass array of connection ids except for peer's to peer
      var connectionsId = [];
      for (var i = 0, len = connections.length; i < len; i++) {
        //var id = connections[i].id;

        if (connections[i] !== socket) {
          connectionsId.push(i);
          connections[i].send(JSON.stringify({ "eventName": "new peer connected", 
            "socketId": i
          }), function(error) { console.log(error)});
        }
      }

      socket.send(JSON.stringify({ "eventName": "get peers", 
        "connections": connectionsId
      }), function(error) { console.log(error)});

      //Receive ice and send to the correct socket
      rtc.on('receive ice candidate', function(data) {
        console.log('receive ice candidate');
        var soc = getSocket(room, data.socketId);

        if (soc) {
          soc.send(JSON.stringify({ "eventName": "receive ice candidate",
            "label": data.label,
            "candidate": data.candidate,
            "socketId": socket.id
          }), function(error) { console.log(error)});
          rtc.fire('receive_ice_candidate');
        }
      });

      //Receive offer and send to correct socket
      rtc.on('send offer', function(data) {
        console.log('send offer');
        var soc = getSocket(room, data.socketId);

        if (soc) {
          soc.send(JSON.stringify({ "eventName": "receive offer", 
            "sdp": data.sdp,
            "socketId": socket.id
          }), function(error) { console.log(error)});
        }
        rtc.fire('send_offer');
      });

      //Receive answer and send to correct socket
      rtc.on('send answer', function(data) {
        console.log('send answer');
        var soc = getSocket(room, data.socketId);

        if (soc) {
          soc.send(JSON.stringify({ "eventName": "receive answer", 
            "sdp": data.sdp,
            "socketId": socket.id
          }), function(error) { console.log(error)});
          rtc.fire('send_answer');
        }
      });

      // remove connection from array and tell everyone else about the
      // disconnect
      rtc.on('close', function(socket) {
        console.log('close');
        //find socket to remove
        var i = sockets.indexOf(socket);
        //remove socket
        sockets.splice(i, 1);

        //var connections = rooms[room];
        
        for (var i = 0; i < connections.length; i++) {
          var id = connections[i].id;

          if (id == socket.id) {
            connections.splice(i, 1);
            i--;
          } else {
            connections[i].send(JSON.stringify({ "eventName": "remove peer connected", 
              "socketId": socket.id
            }), function(error) { console.log(error)});
          }
        }
        rtc.fire('disconnect');
      });
    });

    rtc.fire('connection', rtc);
  });
}
// Gets the socket from an id and room

function getSocket(room, id) {
  /*var connections = rooms[room];

  if (!connections) {
    // TODO: Or error, or customize
    return;
  }*/

  for (var i = 0; i < connections.length; i++) {
    var socket = connections[i];
    if (id === socket.id) {
      return socket;
    }
  }
}