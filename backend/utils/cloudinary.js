import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

try {
    const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, NODE_ENV } = process.env;

    if (!CLOUDINARY_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error("Missing Cloudinary credentials in environment variables.");
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });

    if (NODE_ENV !== "production") {
        console.log("✅ Cloudinary configured with cloud name:", CLOUDINARY_NAME);
    }
} catch (error) {
    console.error("❌ Cloudinary configuration error:", error.message);
    process.exit(1);
}

export default cloudinary;
