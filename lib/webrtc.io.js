//SERVER
var WebSocketServer = require('ws').Server

// Used for callback publish and subscribe
var rtc = {};

//Array to store connections
rtc.sockets = [];

rtc.rooms = [];

// Holds callbacks for certain events.
rtc._events = {};

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

  manager.on('connect', function(socket) {
    // console.log('connect');

    socket.id = id();
//  console.log('-----------------' + socket.id + '-----------------');
    rtc.sockets.push(socket);

    socket.on('message', function(data) {
      var json = JSON.parse(data);
      rtc.fire(json.eventName, json, socket);
    });

    socket.on('close', function() {
      console.log('close');

      // find socket to remove
      var i = rtc.sockets.indexOf(socket);
      // remove socket
      rtc.sockets.splice(i, 1);

      // remove from rooms
      for(var k = 0; k < rtc.rooms.length; k++) {
        var index = rtc.rooms[k].indexOf(socket.id)
        if(index !== -1){
          room[k].splice(index, 1);
        }
      }

      // remove the disconnected socket from the sockets array and send out
      // a notification to all connected peers that socket was removed.
      for (var j = 0; j < rtc.sockets.length; j++) {
        var id = rtc.sockets[j].id;
        if (id === socket.id) {
          rtc.sockets.splice(j, 1);
          j--;
        } else {
          rtc.sockets[j].send(JSON.stringify({
            "eventName": "remove_peer_connected",
            "socketId": socket.id
          }), function(error) {
            if (error) {
              console.log(error);
            }
          });
        }
      }

      // call the disconnect callback
      rtc.fire('disconnect');

    });

    // call the connect callback
    rtc.fire('connect', rtc);

  });

  // manages the built-in room functionality
  rtc.on('join_room', function(data, socket) {
    // console.log('join_room');

    var roomList = rtc.rooms[data.room] || [];
    roomList.push(socket.id);

    rtc.rooms[data.room] = roomList;
    var connectionsId = [];

    for (var i = 0; i < roomList.length; i++) {
      var id = roomList[i];

      if (id == socket.id) {
        continue;
      } else {

        connectionsId.push(id);
        var soc = getSocket(data.room, id);

        // inform the peers that they have a new peer
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
    // send new peer a list of all prior peers
    socket.send(JSON.stringify({
      "eventName": "get_peers",
      "connections": connectionsId
    }), function(error) {
      if (error) {
        console.log(error);
      }
    });
  });

  //Receive ICE candidates and send to the correct socket
  rtc.on('send_ice_candidate', function(data, socket) {
    // console.log('send_ice_candidate');
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

      // call the 'recieve ICE candidate' callback
      rtc.fire('receive ice candidate');
    }
  });

  //Receive offer and send to correct socket
  rtc.on('send_offer', function(data, socket) {
    // console.log('send_offer');
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
    // call the 'send offer' callback
    rtc.fire('send offer');
  });

  //Receive answer and send to correct socket
  rtc.on('send_answer', function(data, socket) {
    // console.log('send_answer');
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

// generate a 4 digit hex code randomly
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// make a REALLY COMPLICATED AND RANDOM id, kudos to dennis
function id() {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function getSocket(room, id) {
  var connections = rtc.sockets;
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
