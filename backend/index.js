// index.js
import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import messageRoute from "./routes/messageRoute.js";
import { setupSocket } from "./socket/socket.js";

dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

// Needed to use __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
if (!process.env.PORT || !process.env.MONGO_URI) {
    console.error("Error: Missing required environment variables (PORT or MONGO_URI)");
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
        origin: ["http://localhost:5173", "http://localhost:5174"], // Support multiple frontend ports
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// Redirect root to login
app.get("/", (req, res) => {
    res.redirect("/login"); // or a frontend route like "/"
});

// Serve frontend
app.use(express.static(path.join(__dirname, "frontend/src/components")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/src/components/Login.jsx"));
});

// Global error-handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

// Connect to DB and start server
const startServer = async () => {
    try {
        await connectDB(); // Wait for DB connection
        const server = setupSocket(app);
        server.listen(port, () => {
            console.log(`🚀 Server listening on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();