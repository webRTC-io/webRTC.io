var Peers = []

function getPeers() {
    return Peers;
}

function addPeer(peer) {
    Peers.push(peer);
}

function removePeer(peer) {
    Peers.splice(Peers.indexOf(peer),1);
}


