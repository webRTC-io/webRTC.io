//SERVER
var WebSocketServer = require('ws').Server

//Array to store connections
var sockets = [];

var rooms = [];

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

    socket.id = id();
    console.log('-----------------' + socket.id + '-----------------');

    sockets.push(socket);

    socket.on('message', function(data) {
      var json = JSON.parse(data);
      rtc.fire(json.eventName, json, socket);
    });

    socket.on('close', function() {
      console.log('close');

      //find socket to remove
      var i = sockets.indexOf(socket);
      //remove socket
      sockets.splice(i, 1);

      for (var j = 0; j < sockets.length; j++) {
        var id = sockets[j].id;

        if (id == socket.id) {
          sockets.splice(j, 1);
          j--;
        } else {
          sockets[j].send(JSON.stringify({
            "eventName": "remove_peer_connected",
            "socketId": socket.id
          }), function(error) {
            if (error) {
              console.log(error);
            }
          });
        }
      }

      rtc.fire('disconnect');

    });

    rtc.fire('connection', rtc);

  });

  rtc.on('join_room', function(data, socket) {
    console.log('join_room');

    var connectionsId = [];

    var roomList = rooms[data.room] || [];

    roomList.push(socket.id);

    rooms[data.room] = roomList;


    for (var i = 0; i < roomList.length; i++) {

      var id = roomList[i];

      if (id == socket.id) {
        continue;
      } else {

        connectionsId.push(id);

        var soc = getSocket(data.room, id);

        if (soc) {
          soc.send(JSON.stringify({
            "eventName": "new_peer_connected",
            "socketId": socket.id
          }), function(error) {
            if (error) {
              console.log(error);
            }
          });
        }
      }
    }
    socket.send(JSON.stringify({
      "eventName": "get_peers",
      "connections": connectionsId
    }), function(error) {
      if (error) {
        console.log(error);
      }
    });
  });

  //Receive ice and send to the correct socket
  rtc.on('send_ice_candidate', function(data, socket) {
    console.log('send_ice_candidate');

    var soc = getSocket(data.room, data.socketId);

    if (soc) {
      soc.send(JSON.stringify({
        "eventName": "receive_ice_candidate",
        "label": data.label,
        "candidate": data.candidate,
        "socketId": socket.id
      }), function(error) {
        if (error) {
          console.log(error);
        }
      });

      rtc.fire('receive ice candidate');
    }
  });

  //Receive offer and send to correct socket
  rtc.on('send_offer', function(data, socket) {
    console.log('send_offer');

    var soc = getSocket(data.room, data.socketId);

    if (soc) {
      soc.send(JSON.stringify({
        "eventName": "receive_offer",
        "sdp": data.sdp,
        "socketId": socket.id
      }), function(error) {
        if (error) {
          console.log(error);
        }
      });
    }
    rtc.fire('send offer');
  });

  //Receive answer and send to correct socket
  rtc.on('send_answer', function(data, socket) {
    console.log('send_answer');

    var soc = getSocket(data.room, data.socketId);

    if (soc) {
      soc.send(JSON.stringify({
        "eventName": "receive_answer",
        "sdp": data.sdp,
        "socketId": socket.id
      }), function(error) {
        if (error) {
          console.log(error);
        }
      });
      rtc.fire('send answer');
    }
  });
}

// Gets the socket from an id and room

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function id() {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function getSocket(room, id) {
  var connections = sockets;
  //var connections = rooms[room];
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