import net from 'node:net';
import { Client } from './Client.js';
import { decrypt, encrypt, hash } from '../utils/crypto.js';
import { sendMsg, onMsg } from '../utils/socket.js';

export class Alice extends Client {
    constructor(uid: string, Kmaster: Buffer) {
        super(uid, Kmaster);
    }

    requestSessionKey(kdcHost: string, kdcPort: number, IDB: string): Promise<{ KS: Buffer; ticket: string }> {
        return new Promise((resolve, reject) => {
            const socket = net.createConnection(kdcPort, kdcHost, () => {
                console.log(`[ALICE]         Connected to KDC at ${kdcHost}:${kdcPort}`);
                console.log(`[ALICE] [STEP 1] Sending request → IDA: ${this.uid}, IDB: ${IDB}`);
                sendMsg(socket, { IDA: this.uid, IDB });
            });

            onMsg(socket, (data) => {
                try {
                    console.log(`[ALICE] [STEP 3] Received E(KA, KS): ${data.encKA}`);
                    const plain = decrypt(this.Kmaster, data.encKA);
                    const { KS: KShex } = JSON.parse(plain) as { KS: string };
                    const KS = Buffer.from(KShex, 'hex');
                    console.log(`[ALICE] [STEP 3] Decrypted KS: ${KS.toString('hex')}`);
                    console.log(`[ALICE] [STEP 4] Received ticket E(KB, KS||IDA): ${data.ticket}`);
                    socket.end();
                    resolve({ KS, ticket: data.ticket });
                } catch (err) { reject(err); }
            });

            socket.on('error', reject);
        });
    }

    sendSecureMessage(
        bobHost: string, bobPort: number,
        ticket: string, KS: Buffer, M: string,
        flipHash = false
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const HM = hash(M);
            console.log(`[ALICE] [STEP 7] M: "${M}"`);
            console.log(`[ALICE] [STEP 7] H(M): ${HM}`);

            let HMToSend = HM;
            if (flipHash) {
                HMToSend = (HM[0] === 'a' ? 'b' : 'a') + HM.slice(1);
                console.log(`[ALICE] [STEP 7] [INTEGRITY TEST] Flipped H(M): ${HMToSend}`);
            }

            const encMessage = encrypt(KS, JSON.stringify({ M, HM: HMToSend }));
            console.log(`[ALICE] [STEP 7] E(KS, M||H(M)): ${encMessage}`);

            const socket = net.createConnection(bobPort, bobHost, () => {
                console.log(`[ALICE]         Connected to Bob at ${bobHost}:${bobPort}`);
                sendMsg(socket, { ticket, message: encMessage });
                console.log(`[ALICE] [STEP 5] Forwarded ticket E(KB, KS||IDA) to Bob`);
                console.log(`[ALICE] [STEP 7] Sent E(KS, M||H(M)) to Bob`);
                socket.end();
                resolve();
            });

            socket.on('error', reject);
        });
    }

    sendPlainMessage(bobHost: string, bobPort: number, M: string): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log(`[ALICE] [BASELINE] M (plaintext): "${M}"`);
            const socket = net.createConnection(bobPort, bobHost, () => {
                console.log(`[ALICE] [BASELINE] Connected to Bob, sending plaintext`);
                sendMsg(socket, { message: M });
                socket.end();
                resolve();
            });
            socket.on('error', reject);
        });
    }
}
