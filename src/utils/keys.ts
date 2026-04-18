import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const KEYS_DIR = join(process.cwd(), 'keys');

export function saveKey(uid: string, key: Buffer): void {
    if (!existsSync(KEYS_DIR)) mkdirSync(KEYS_DIR, { recursive: true });
    writeFileSync(join(KEYS_DIR, `${uid}.key`), key.toString('hex'), 'utf8');
}

export function loadKey(uid: string): Buffer {
    const keyFile = join(KEYS_DIR, `${uid}.key`);
    if (!existsSync(keyFile)) {
        throw new Error(`Master key for "${uid}" not found.`);
    }
    return Buffer.from(readFileSync(keyFile, 'utf8').trim(), 'hex');
}
