import Notification from "../models/notificationModel.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.id })
            .populate("sender", "username profilePicture")
            .sort({ createdAt: -1 });

        return res.json({ success: true, notifications });
    } catch (error) {
        console.error("getNotifications error:", error);
        return res.status(500).json({ success: false, message: "Error fetching notifications" });
    }
};

export const markNotificationsSeen = async (req, res) => {
    try {
        await Notification.updateMany(
            { receiver: req.id, seen: false },
            { $set: { seen: true } }
        );

        const userSocketId = getReceiverSocketId ? getReceiverSocketId(req.id) : null;
        if (io && userSocketId) {
            console.log(`Emitting notificationsSeen to ${req.id} at socket ${userSocketId}`);
            io.to(userSocketId).emit("notificationsSeen", {
                message: "Notifications marked as seen"
            });
        } else {
            console.warn(`Socket.IO not available or no socket for user ${req.id}`);
        }

        return res.status(200).json({ success: true, message: "Notifications marked as seen" });
    } catch (error) {
        console.error("markNotificationsSeen error:", error);
        return res.status(500).json({ success: false, message: "Failed to mark as seen" });
    }
};