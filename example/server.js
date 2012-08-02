var io = require('../lib/webrtc.io').listen(8001);
var colors = {};

io.sockets.on('connection', function(socket) {
  console.log("connection received");

  colors[socket.id] = Math.floor(Math.random()* 0xFFFFFF)
  socket.on('chat msg', function(msg) {
    console.log("chat received");
    
    socket.broadcast.emit('receive chat msg', {
      msg: msg,
      color: colors[socket.id]
    });
  });
});

