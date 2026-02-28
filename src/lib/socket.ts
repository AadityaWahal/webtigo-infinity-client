import { io, Socket } from 'socket.io-client';

// Use environment variable or default to localhost:3001
const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Singleton instance to prevent multiple connections holding up
class SocketService {
    private static instance: Socket | null = null;

    public static getInstance(): Socket {
        if (!SocketService.instance) {
            SocketService.instance = io(SOCKET_URL, {
                reconnectionAttempts: 5,
                transports: ['websocket', 'polling'], // Fallback if websockets don't work
            });
        }
        return SocketService.instance;
    }
}

export const socket = SocketService.getInstance();
