import net from 'node:net';
import { Client } from './Client.js';
import { decrypt, hash } from '../utils/crypto.js';
import { onMsg } from '../utils/socket.js';

export class Bob extends Client {
    public port: number;

    constructor(uid: string, Kmaster: Buffer, port: number) {
        super(uid, Kmaster);
        this.port = port;
    }

    listen(): void {
        const server = net.createServer((socket) => {
            console.log(`\n[BOB]         Alice connected from ${socket.remoteAddress}`);

            onMsg(socket, (data) => {
                try {
                    console.log(`[BOB] [STEP 5] Received ticket E(KB, KS||IDA): ${data.ticket}`);
                    const ticketPlain = decrypt(this.Kmaster, data.ticket);
                    const { KS: KShex, IDA } = JSON.parse(ticketPlain) as { KS: string; IDA: string };
                    const KS = Buffer.from(KShex, 'hex');
                    console.log(`[BOB] [STEP 6] Decrypted ticket → KS: ${KS.toString('hex')}, IDA: "${IDA}"`);

                    console.log(`[BOB] [STEP 7] Received E(KS, M||H(M)): ${data.message}`);
                    const msgPlain = decrypt(KS, data.message);
                    const { M, HM } = JSON.parse(msgPlain) as { M: string; HM: string };
                    console.log(`[BOB] [STEP 8] Decrypted M: "${M}"`);
                    console.log(`[BOB] [STEP 8] Received  H(M): ${HM}`);

                    const computedHM = hash(M);
                    console.log(`[BOB] [STEP 9] Computed  H(M): ${computedHM}`);

                    if (computedHM === HM) {
                        console.log(`[BOB] [STEP 9] Verification OK ✓`);
                    } else {
                        console.log(`[BOB] [STEP 9] Verification Failed ✗`);
                    }
                } catch (err) {
                    console.error(`[BOB] Error processing message:`, err);
                }
            });
        });

        server.listen(this.port, () => {
            console.log(`[BOB]         Listening on port ${this.port}`);
        });
    }

    listenPlain(): void {
        const server = net.createServer((socket) => {
            console.log(`\n[BOB] [BASELINE] Alice connected from ${socket.remoteAddress}`);
            onMsg(socket, (data) => {
                console.log(`[BOB] [BASELINE] Received plaintext M: "${data.message}"`);
            });
        });
        server.listen(this.port, () => {
            console.log(`[BOB] [BASELINE] Listening for plaintext on port ${this.port}`);
        });
    }
}
