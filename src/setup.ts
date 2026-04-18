// runs once to generate master keys
import { createKey } from './utils/crypto.js';
import { saveKey } from './utils/keys.js';

const KA = createKey();
const KB = createKey();

saveKey('alice', KA);
saveKey('bob', KB);

console.log('[SETUP] Alice master key (KA-KDC):', KA.toString('hex'));
console.log('[SETUP] Bob master key (KB-KDC):', KB.toString('hex'));
console.log('[SETUP] Keys saved to keys/');
