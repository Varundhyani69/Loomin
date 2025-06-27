// context/SocketContext.js
import { createContext } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket"],
    query: {
        userId: localStorage.getItem("userId"), // or however you track current user
    },
});

const SocketContext = createContext(socket);
export default SocketContext;
