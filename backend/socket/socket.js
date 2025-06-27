// socket/socket.js
import { Server } from "socket.io";

const userSocketMap = {};
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

let io;

const allowedOrigins = [
    "http://localhost:5173",
    "https://loomin-production.up.railway.app",
];

const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap[userId] = socket.id;
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            if (userId) delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });

        socket.on("error", (err) => {
            console.error("WebSocket error:", err);
        });

        socket.on("connect_error", (err) => {
            console.error("WebSocket connection error:", err.message);
        });
    });

    return io;
};

export { setupSocket, io };
