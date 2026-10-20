import { io, Socket } from 'socket.io-client';

// Use environment variable or fallback to local backend on port 3000
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

class SocketService {
    private static instance: Socket | null = null;

    public static getInstance(): Socket {
        if (!SocketService.instance) {
            SocketService.instance = io(BACKEND_URL, {
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1500,
                transports: ['websocket', 'polling'],
            });
        }
        return SocketService.instance;
    }
}

export const socket = SocketService.getInstance();
