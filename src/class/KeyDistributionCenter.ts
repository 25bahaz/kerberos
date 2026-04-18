import { createKey, encrypt } from '../utils/crypto.js';

export class KeyDistributionCenter {
    private masterKeys = new Map<string, Buffer>();

    register(uid: string, key: Buffer): void {
        this.masterKeys.set(uid, key);
        console.log(`[KDC]         Registered master key for "${uid}": ${key.toString('hex')}`);
    }

    handleRequest(IDA: string, IDB: string): { encKA: string; ticket: string } {
        const KA = this.masterKeys.get(IDA);
        const KB = this.masterKeys.get(IDB);
        if (!KA) throw new Error(`Unknown client: ${IDA}`);
        if (!KB) throw new Error(`Unknown client: ${IDB}`);

        const KS = createKey();
        console.log(`[KDC] [STEP 2] Generate KS: ${KS.toString('hex')}`);

        const encKA = encrypt(KA, JSON.stringify({ KS: KS.toString('hex') }));
        console.log(`[KDC] [STEP 3] E(KA, KS)      → ${encKA}`);

        const ticket = encrypt(KB, JSON.stringify({ KS: KS.toString('hex'), IDA }));
        console.log(`[KDC] [STEP 4] E(KB, KS||IDA) → ${ticket}`);

        return { encKA, ticket };
    }
}
