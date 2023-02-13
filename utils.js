const MAX_LENGTH = 1024 * 1
const HEADER_PAD_AMMOUNT = 9
let packet_index = 0

function pad(number, ammount = 5) {
    let start = `${number}`;

    const needed = Math.max((ammount - start.length), 0);

    for (let i = 0; i < needed; i++) {
        start = `0${start}`;
    }

    return start;
}

function getId() {
    const id = packet_index;
    packet_index++
    return pad(id, HEADER_PAD_AMMOUNT)
}

function encode_header(id, index = 0, total = 0) {
    return Buffer.from(`${id}|${pad(index, HEADER_PAD_AMMOUNT)}|${pad(total, HEADER_PAD_AMMOUNT)}`)
}

function decode_header(header) {
    console.log(header.toString('utf-8'))
    return header.toString('utf-8').split("|").map(a => parseInt(a))
}

const HEADER_LENGTH = encode_header(getId()).length
const ID_LENGTH = getId().length
const DATA_TOTAL = MAX_LENGTH - HEADER_LENGTH

function make_fragments(data) {
    const asBuff = Buffer.from(data);

    const parts = [];

    if (asBuff.length <= DATA_TOTAL) {
        parts.push(Buffer.concat([encode_header(getId()), asBuff]));
    }
    else {
        console.log(asBuff.length, DATA_TOTAL)
        const total = Math.ceil(asBuff.length / DATA_TOTAL)
        const packetId = getId()
        for (let i = 0; i < total; i++) {
            if (i !== total.length - 1) {
                parts.push(Buffer.concat([encode_header(packetId, i, total - 1), asBuff.subarray(i * DATA_TOTAL, (i + 1) * DATA_TOTAL)]));
            }
            else {
                parts.push(Buffer.concat([encode_header(packetId, i, total - 1), asBuff.subarray(i * DATA_TOTA, asBuff.length)]));
            }
        }
    }

    return parts
}

function break_fragment(fragment) {
    return [...decode_header(fragment.subarray(0, HEADER_LENGTH)), fragment.subarray(HEADER_LENGTH, fragment.length)]
}

function join_fragments(fragments) {
    return fragments.sort((a, b) => a[0] - b[0]).reduce((total, [index, fragment]) => {
        return Buffer.concat([total, fragment])
    }, Buffer.alloc(0));
}

module.exports = {
    pad, getId, encode_header, decode_header, make_fragments, break_fragment, join_fragments
}

