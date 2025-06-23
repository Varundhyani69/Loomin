import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";


export const sendMessage = async (req, res) => {
    try {
        const { message, postId } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        const newMsg = await Message.create({ senderId, receiverId, message, postId });

        // Add message to existing conversation or create new one
        let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                messages: [newMsg._id]
            });
        } else {
            conversation.messages.push(newMsg._id);
            await conversation.save();
        }

        // Emit socket message to receiver
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMsg);
        }

        res.status(201).json({ success: true, newMessage: newMsg });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};


export const getMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate({
            path: 'messages',
            populate: {
                path: 'postId',
                select: 'image caption'
            }
        });

        if (!conversation) {
            return res.status(200).json({ success: true, messages: [] });
        }

        return res.status(200).json({ success: true, messages: conversation.messages || [] });
    } catch (error) {
        console.error("Error in getMessage:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
