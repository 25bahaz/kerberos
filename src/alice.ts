import { Alice } from './class/Alice.js';
import { loadKey } from './utils/keys.js';

const KDC_HOST = '127.0.0.1';
const KDC_PORT  = 3000;
const BOB_HOST  = '127.0.0.1';
const BOB_PORT  = 3001;

const M = '150210038 Network Security';

const plaintext = process.env.PLAINTEXT === '1';
const flipHash  = process.env.FLIP_HASH  === '1';

const alice = new Alice('alice', loadKey('alice'));

if (plaintext) {
    await alice.sendPlainMessage(BOB_HOST, BOB_PORT, M);
} else { // Kerberos protocol
    const { KS, ticket } = await alice.requestSessionKey(KDC_HOST, KDC_PORT, 'bob');
    await alice.sendSecureMessage(BOB_HOST, BOB_PORT, ticket, KS, M, flipHash);
}
