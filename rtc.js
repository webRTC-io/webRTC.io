
module.exports ={
	connections: [],

	addPeer: function(socket, peer) {
		var connection = {
			id: socket.id,
			socket: socket,
			peer: peer
		};
		this.connections.push(connection);
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

		for(con in this.connections) {
			peers.push(con.peer);
		}

		return peers;
	},

	getFromPeer: function(peer) {

		for(con in this.connections) {
			if(con.peer === peer){
				return con;
			}
		}
	},

	getFromSocket: function(socket) {

		for(con in this.connections) {
			if(con.socket === socket){
				return con;
			}
		}
	}
};
