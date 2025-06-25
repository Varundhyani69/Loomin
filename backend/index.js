// index.js
import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./utils/db.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import messageRoute from "./routes/messageRoute.js";
import { setupSocket } from "./socket/socket.js";

dotenv.config();

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
if (!process.env.PORT || !process.env.MONGO_URI) {
    console.error("❌ Missing PORT or MONGO_URI in .env");
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 8080;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://your-frontend-domain.com" // ✅ Replace with deployed frontend domain
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// ✅ Serve Frontend (Vite build output)
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

// Start Server with DB & Socket
const startServer = async () => {
    try {
        await connectDB();
        const server = setupSocket(app);
        server.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

startServer();
