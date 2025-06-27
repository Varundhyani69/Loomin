// socket/socket.js
import { Server } from "socket.io";

const userSocketMap = {};
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            // Allow both development and production frontend origins
            origin: (origin, callback) => {
                const allowedOrigins = [
                    "http://localhost:5173",
                    "https://loomin-production.up.railway.app",
                    "https://loomin-backend-production.up.railway.app", // Added to match frontend socket URL
                    // Add your actual frontend production URL here, e.g., "https://your-frontend-domain.com"
                ];
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
        if (userId) {
            userSocketMap[userId] = socket.id;
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
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

export { setupSocket };