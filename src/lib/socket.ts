import { io, Socket } from 'socket.io-client';

// Use environment variable or default to the live Render server
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://webtigo-canvas-server.onrender.com';

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
