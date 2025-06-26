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
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            userSocketMap[userId] = socket.id;
            // console.log(`User connected: ${userId}, Socket: ${socket.id}`);
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            if (userId) {
                // console.log(`User disconnected: ${userId}, Socket: ${socket.id}`);
                delete userSocketMap[userId];
            }
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });

    return server;
};

export { setupSocket, io };
