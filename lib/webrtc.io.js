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

    socket.id = id();
    console.log('-----------------' + socket.id + '-----------------');

    sockets.push(socket);

    socket.on('message', function(data) {
      console.log('message');
      var json = JSON.parse(data);
      rtc.fire(json.eventName, json, socket);
    });

    socket.on('close', function(socket) {
      console.log('close');

      //find socket to remove
      var i = sockets.indexOf(socket);
      //remove socket
      sockets.splice(i, 1);

      //var connections = rooms[room];
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
            console.log(error)
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

    for (var i = 0; i < sockets.length; i++) {

      var id = sockets[i].id;

      if (id == socket.id) {
        continue;
      } else {

        connectionsId.push(id);

        sockets[i].send(JSON.stringify({
          "eventName": "new_peer_connected",
          "socketId": socket.id
        }));
      }
    }
    socket.send(JSON.stringify({
      "eventName": "get_peers",
      "connections": connectionsId
    }));
  });

  //Receive ice and send to the correct socket
  rtc.on('receive_ice_candidate', function(data, socket) {
    console.log('receive ice candidate');

    console.log('---receive ice candidate--->' + data.socketId);
    console.log('---receive ice candidate--->' + socket.id);

    var soc = getSocket(data.room, data.socketId);

    if (soc) {
      soc.send(JSON.stringify({
        "eventName": "receive_ice_candidate",
        "label": data.label,
        "candidate": data.candidate,
        "socketId": socket.id
      }), function(error) {
        console.log(error)
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
        console.log(error)
      });
    }
    rtc.fire('send offer');
  });

  //Receive answer and send to correct socket
  rtc.on('send_answer', function(data, socket) {
    console.log('send_answer');

    var soc = getSocket(data.room, data.socketId);

    console.log('--------send answer---------->' + data.socketId);

    console.log('--------send answer---------->' + socket.id);

    if (soc) {
      soc.send(JSON.stringify({
        "eventName": "receive_answer",
        "sdp": data.sdp,
        "socketId": socket.id
      }), function(error) {
        console.log(error)
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