import net from 'node:net';

export function sendMsg(socket: net.Socket, data: object): void {
    socket.write(JSON.stringify(data) + '\n');
}

export function onMsg(socket: net.Socket, callback: (data: Record<string, string>) => void): void {
    let buffer = '';
    socket.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const parts = buffer.split('\n');
        buffer = parts.pop()!;
        for (const part of parts) {
            if (part.trim()) callback(JSON.parse(part) as Record<string, string>);
        }
    });
}
