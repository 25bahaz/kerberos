import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'node:crypto';

export function createKey(): Buffer {
    return randomBytes(32);
}

export function encrypt(Ks: Buffer, M: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', Ks, iv);
    const ciphertext = Buffer.concat([cipher.update(M, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

export function decrypt(Ks: Buffer, M: string): string {
    const data = Buffer.from(M, 'base64');
    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const ciphertext = data.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', Ks, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

export function hash(M: string): string {
    return createHash('sha256').update(M, 'utf8').digest('hex');
}
