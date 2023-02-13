const udp = require('dgram')
const { make_fragments, break_fragment, join_fragments } = require('./utils')
const fragmentBank = {}


function onRecievedFullPacket(packet, info) {
    console.log(">>", "Packet decoded", info)
}
const server = udp.createSocket('udp4', (msg, info) => {
    const [packet_id, index, total, packet] = break_fragment(msg)

    console.log("<<", "Part", index, total)
    if (index === 0 && index === total) {
        onRecievedFullPacket(packet, info)
        return;
    }

    if (!fragmentBank[packet_id]) {
        fragmentBank[packet_id] = []
    }

    fragmentBank[packet_id].push([index, packet]);
    console.log(`Recieved ${fragmentBank[packet_id].length} packets out of ${total + 1} Packets | Loss ${100 - ((fragmentBank[packet_id].length / (total + 1)) * 100).toFixed(4)}%`)
    if (fragmentBank[packet_id].length === total + 1) {
        fragmentBank[packet_id].push([index, packet]);

        onRecievedFullPacket(join_fragments(fragmentBank[packet_id]), info);
        delete fragmentBank[packet_id];
        return;
    }
})

server.bind(9000, 'localhost', () => {
    console.log("Server bound to", 9000)
})