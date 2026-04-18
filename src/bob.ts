import { Bob } from './class/Bob.js';
import { loadKey } from './utils/keys.js';

const BOB_PORT  = 3001;
const plaintext = process.env.PLAINTEXT === '1';

const bob = new Bob('bob', loadKey('bob'), BOB_PORT);

if (plaintext) {
    bob.listenPlain();
} else {
    bob.listen();
}
