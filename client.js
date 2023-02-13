const udp = require('dgram')
const { make_fragments, break_fragment, join_fragments } = require('./utils')
const fragmentBank = {}


function onRecievedFullPacket(packet, info) {
    console.log(">>", packet.toString('utf-8'), info)
}

const client = udp.createSocket('udp4', (msg, info) => {
    const [packet_id, index, total, packet] = break_fragment(msg)


    if (index === 0 && index === total) {
        onRecievedFullPacket(packet, info)
        return;
    }

    if (!fragmentBank[packet_id]) {
        fragmentBank[packet_id] = []
    }

    fragmentBank[packet_id].push([index, packet]);

    if (fragmentBank[packet_id].length === total + 1) {
        fragmentBank[packet_id].push([index, packet]);

        onRecievedFullPacket(join_fragments(fragmentBank[packet_id]), info);
        delete fragmentBank[packet_id];
        return;
    }

})

client.bind(9500, 'localhost', () => {
    console.log("Client bound to", 9500)
    const data = Buffer.from(new Array(90000).fill('fill this shit').join(""))

    console.log("prepared data, sending")
    make_fragments(data).forEach((f, idx) => {
        console.log(">>", `Part ${idx + 1}`)
        client.send(f, 9000, 'localhost')
    })
})