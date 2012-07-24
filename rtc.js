var rtc = {

	connections: [],

	addPeer: function addPeer(peer, socket) {
		var connection = {
			id: socket.id,
			socket: socket,
			peer: peer
		};
		connections.push(connection);
	},

	removePeer: function(socket) {
		for(var i=0; i<connections.length; i++) {
			
			if(connections[i].id === socket.id){
				connections.splice(i, 1);
			}
		}
	},

	getPeers: function() {
		var peers = [];

		for(con in connections) {
			peers.push(con.peer);
		}

		return peers;
	},

	getFromPeer: function getFromPeer(peer) {

		for(con in connections) {
			if(con.peer === peer){
				return con;
			}
		}
	},

	getFromSocket: function getFromSocket(socket) {

		for(con in connections) {
			if(con.socket === socket){
				return con;
			}
		}
	}
};
