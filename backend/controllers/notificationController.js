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
