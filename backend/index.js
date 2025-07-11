import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import messageRoute from "./routes/messageRoute.js";
import { setupSocket } from "./socket/socket.js";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

if (!process.env.PORT || !process.env.MONGO_URI) {
    console.error("Error: Missing required environment variables (PORT or MONGO_URI)");
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                "https://loomin.onrender.com",
                "http://localhost:5173",
                "https://loomin-production.up.railway.app",
                "https://loomin-backend-production.up.railway.app",

            ];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

app.use("/uploads", express.static("uploads"));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

const startServer = async () => {
    try {
        await connectDB();
        const server = http.createServer(app);

        setupSocket(server);

        server.listen(port, () => {
            console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();