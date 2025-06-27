import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.id })
            .populate("sender", "username profilePicture")
            .sort({ createdAt: -1 });

        return res.json({ success: true, notifications });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching notifications" });
    }
};

// ✅ Add this in notificationController.js
export const markNotificationsSeen = async (req, res) => {
    try {
        // If you ever store "seen" state in DB, update here.
        // For now, just acknowledge it's been read.
        return res.status(200).json({ success: true, message: "Notifications marked as seen" });
    } catch (error) {
        console.error("Error marking notifications as seen:", error);
        return res.status(500).json({ success: false, message: "Failed to mark as seen" });
    }
};
