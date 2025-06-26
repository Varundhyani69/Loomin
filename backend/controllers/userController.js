import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataURI.js";
import cloudinary from "../utils/cloudinary.js";
import Notification from "../models/notificationModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// REGISTER
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Something is missing" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });

        return res.status(200).json({
            success: true,
            message: "Account created successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Something is missing" });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not registered" });
        }

        const passMatch = await bcrypt.compare(password, user.password);
        if (!passMatch) {
            return res.status(401).json({ success: false, message: "Wrong password" });
        }

        let token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const populatedPosts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        };

        return res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        }).json({
            success: true,
            message: `Welcome back ${user.username}`,
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// LOGOUT
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        }).json({ success: true, message: "Logout successfully" });
    } catch (error) {
        console.log(error);
    }
};

// GET PROFILE
export const getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id)
            .populate({
                path: 'posts',
                model: 'Post',
            })
            .populate({
                path: 'bookmarks',
                model: 'Post',
                populate: {
                    path: 'author',
                    model: 'User',
                },
            });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// EDIT PROFILE
export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;

        const user = await User.findById(userId).select('-password');
        if (!user) return res.json({ success: false, message: "User not found" });

        if (bio) user.bio = bio;
        if (gender) user.gender = gender;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            const cloudResponse = await cloudinary.uploader.upload(fileUri);
            user.profilePicture = cloudResponse.secure_url;
        }

        await user.save();
        return res.json({ success: true, message: "Profile updated", user });
    } catch (error) {
        console.log(error);
    }
};

// GET SUGGESTED USERS
export const getSuggestesUser = async (req, res) => {
    try {
        const user = req.user;

        // 💥 FIX: check if user is valid
        if (!user || !user.following) {
            return res.status(400).json({ success: false, message: "Invalid user or no following list" });
        }

        const followingIds = user.following.map(id => id.toString());

        const suggestions = await User.find({
            _id: { $ne: user._id, $nin: followingIds }
        }).limit(10).select("username profilePicture");

        res.status(200).json({ success: true, suggestions });

    } catch (err) {
        console.error("getSuggestesUser error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};



// FOLLOW / UNFOLLOW
export const followOrUnfollow = async (req, res) => {
    try {
        const userId = req.id;
        const targetId = req.params.id;

        if (userId === targetId) {
            return res.json({ success: false, message: "You cannot follow/unfollow yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetId);
        if (!user || !targetUser) {
            return res.json({ success: false, message: "User not found" });
        }

        const isFollowing = user.following.includes(targetId);

        if (isFollowing) {
            await Promise.all([
                User.updateOne({ _id: userId }, { $pull: { following: targetId } }),
                User.updateOne({ _id: targetId }, { $pull: { followers: userId } })
            ]);

            return res.json({ success: true, message: "Unfollowed successfully" });
        } else {
            await Promise.all([
                User.updateOne({ _id: userId }, { $push: { following: targetId } }),
                User.updateOne({ _id: targetId }, { $push: { followers: userId } })
            ]);

            await Notification.create({ sender: userId, receiver: targetId, type: "follow" });

            const senderDetails = await User.findById(userId).select("username profilePicture");
            const targetSocketId = getReceiverSocketId(targetId);
            if (targetSocketId) {
                io.to(targetSocketId).emit("notification", {
                    type: "follow",
                    userId,
                    userDetails: senderDetails,
                    message: "started following you"
                });
            }

            return res.json({ success: true, message: "Followed successfully" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// DELETE USER
export const deleteUser = async (req, res) => {
    try {
        const userId = req.id;

        // Delete all posts by the user
        await Post.deleteMany({ author: userId });
        // Remove user from others' followers/following
        await User.updateMany({ followers: userId }, { $pull: { followers: userId } });
        await User.updateMany({ following: userId }, { $pull: { following: userId } });
        // Delete user itself
        await User.findByIdAndDelete(userId);

        // Delete notifications sent or received by user
        await Notification.deleteMany({
            $or: [{ sender: userId }, { receiver: userId }]
        });

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to delete account" });
    }
};

// GET PEOPLE I FOLLOW
export const getFollowings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('following', 'username profilePicture');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, followings: user.following });
    } catch (error) {
        console.error("getFollowings error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};



// Search users by username
export const searchUsers = async (req, res) => {
    try {
        const username = req.query.username;
        if (!username) {
            return res.status(400).json({ success: false, message: "Username query is required" });
        }

        const users = await User.find({
            username: { $regex: username, $options: 'i' }
        }).select("_id username profilePicture");

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getUserBookmarks = async (req, res) => {
    try {
        const profile = await User.findById(req.params.id)
            .populate('posts')
            .populate({
                path: 'bookmarks',
                model: 'Post',
                populate: { path: 'author', model: 'User' }
            })
            .populate('followers')
            .populate('following');

        if (!profile) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, bookmarks: profile.bookmarks });
    } catch (err) {
        console.error("getUserBookmarks error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("🚨 Error in getMyProfile:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


