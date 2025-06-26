// socket/socket.js
import { Server } from "socket.io";
import http from "http";

const userSocketMap = {};
export const getReceiverSocketId = (recieverId) => userSocketMap[recieverId];

let io;

const setupSocket = (app) => {
    const server = http.createServer(app);

    io = new Server(server, {
        cors: {
            origin: process.env.VITE_API_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            userSocketMap[userId] = socket.id;
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            if (userId) {
                delete userSocketMap[userId];
            }
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });

    return server;
};

export { setupSocket, io };
