import { Server } from "socket.io";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const userSocketMap = {};
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

let io; // Define io at module level

// Enable Socket.IO debugging
process.env.DEBUG = 'socket.io*';

const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                const allowedOrigins = [
                    "http://localhost:5173",
                    "https://loomin-production.up.railway.app",
                    "https://loomin-backend-production.up.railway.app",
                    // Add your actual frontend production URL here
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
        maxHttpBufferSize: 1e8, // 100 MB to handle large payloads
    });

    // JWT authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.match(/token=([^;]+)/)?.[1];
            if (!token) {
                throw new Error("Token not found");
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (!user) {
                throw new Error("User not found");
            }
            socket.user = user;
            socket.userId = user._id;
            next();
        } catch (error) {
            // console.error("Socket auth error:", error.message);
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", async (socket) => {
        const userId = socket.userId || socket.handshake.query.userId;
        console.log(`Handshake query:`, socket.handshake.query);
        console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);

        if (userId) {
            try {
                const user = await User.findById(userId);
                if (!user) {
                    console.error(`Invalid userId: ${userId}`);
                    socket.disconnect(true);
                    return;
                }
                userSocketMap[userId] = socket.id;
            } catch (error) {
                console.error("Error validating userId:", error.message);
                socket.disconnect(true);
                return;
            }
        } else {
            console.error("No valid userId provided");
            socket.disconnect(true);
            return;
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
            if (userId) delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });

        socket.on("error", (err) => {
            // console.error("WebSocket error:", err);
        });

        socket.on("connect_error", (err) => {
            // console.error("WebSocket connection error:", err.message);
        });
    });

    return io;
};

export { setupSocket, io };