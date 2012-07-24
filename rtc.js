module.exports = {
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
		for (var i = 0; i < connections.length; i++) {

			if (connections[i].id === socket.id) {
				connections.splice(i, 1);
			}
		}
	},

	getPeers: function() {
		var peers = [];

		for (var i = 0, len = this.connections.length; i < len; i++) {
			var connection = this.connections[i];
			peers.push(connection.peer);
		}

		return peers;
	},

	getFromPeer: function(peer) {

		for (var i = 0, len = this.connections.length; i < len; i++) {
			var connection = this.connections[i];

			if (connection.peer === peer) {
				return con;
			}
		}
	},

	getFromSocket: function(socket) {

		for (var i = 0, len = this.connections.length; i < len; i++) {
			var connection = this.connections[i];
			if (connection.socket === socket) {
				return connection;
			}
		}
	}
};