import net from 'node:net';
import { KeyDistributionCenter } from './class/KeyDistributionCenter.js';
import { loadKey } from './utils/keys.js';
import { sendMsg, onMsg } from './utils/socket.js';

const KDC_PORT = 3000;

const kdc = new KeyDistributionCenter();
kdc.register('alice', loadKey('alice'));
kdc.register('bob',   loadKey('bob'));

const server = net.createServer((socket) => {
    console.log(`\n[KDC]         New connection from ${socket.remoteAddress}`);

    onMsg(socket, (data) => {
        const { IDA, IDB } = data;
        console.log(`[KDC] [STEP 1] Received request → IDA="${IDA}", IDB="${IDB}"`);
        try {
            const { encKA, ticket } = kdc.handleRequest(IDA, IDB);
            sendMsg(socket, { encKA, ticket });
            console.log(`[KDC] [STEP 3] Sent E(KA, KS) + E(KB, KS||IDA) to Alice`);
            socket.end();
        } catch (err) {
            console.error('[KDC] Error:', err);
            socket.end();
        }
    });
});

server.listen(KDC_PORT, () => {
    console.log(`[KDC]         Server listening on port ${KDC_PORT}`);
});
