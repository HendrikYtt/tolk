import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer | null = null;

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
    io = new SocketServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5174',
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            // Client disconnected
        });
    });

    return io;
};

export const getSocketServer = (): SocketServer | null => io;
