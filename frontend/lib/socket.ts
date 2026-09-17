import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api";

let socket: Socket | null = null;

export function getSocket(tokenOverride?: string | null): Socket {
  const token = tokenOverride || getAccessToken();

  const getSocketUrl = () => {
    if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
    if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      // Default to backend port 4000 (Express) or 4001 (NestJS)
      return `http://${hostname}:4000`;
    }
    return "http://localhost:4000";
  };

  const socketUrl = getSocketUrl();

  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,
      withCredentials: true,
      auth: (cb) => {
        const activeToken = tokenOverride || getAccessToken();
        cb({ token: activeToken });
      },
    });
  } else if (token) {
    socket.auth = { token };
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
