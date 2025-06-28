import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Comment from "../models/commentModel.js";
import Notification from "../models/notificationModel.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

export const getFollowingPosts = async (req, res) => {
    try {
        const currentUser = await User.findById(req.id).populate('following');

        if (!currentUser || !currentUser.following) {
            return res.status(400).json({ success: false, message: "Invalid user or no following list" });
        }

        const posts = await Post.find({
            author: { $in: [...currentUser.following.map(f => f._id), currentUser._id] }
        })
            .populate("author", "username profilePicture")
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, posts });
    } catch (error) {
        console.error("getFollowingPosts error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllPost = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        const followingIds = user.following;
        const posts = await Post.find({ author: { $in: followingIds } })
            .populate("author", "username profilePicture")
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            })
            .sort({ createdAt: -1 });
        return res.json({
            success: true,
            posts
        });
    } catch (error) {
        console.error("getAllPost error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'username profilePicture'
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.json({
            posts,
            success: true
        });
    } catch (error) {
        console.error("getUserPost error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getComments = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ post: postId }).populate('author', 'username profilePicture');
        if (!comments) {
            return res.json({
                success: false,
                message: "No comments found"
            });
        }
        return res.json({
            success: true,
            message: "Comments found",
            comments
        });
    } catch (error) {
        console.error("getComments error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        console.log("[Delete Post] ID:", postId);

        const post = await Post.findById(postId);
        if (!post) {
            console.log("[Delete Post] Post not found");
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        if (post.author.toString() !== authorId.toString()) {
            console.log("[Delete Post] Unauthorized attempt by", authorId);
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await Post.findByIdAndDelete(postId);
        console.log("[Delete Post] Post deleted from DB");

        const user = await User.findById(authorId);
        user.posts = user.posts.filter(p => p.toString() !== postId);
        await user.save();
        console.log("[Delete Post] Removed post reference from user");

        await Comment.deleteMany({ post: postId });
        console.log("[Delete Post] Deleted all comments for the post");

        return res.json({ success: true, message: "Post deleted" });
    } catch (error) {
        console.error("deletePost error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const editCaption = async (req, res) => {
    try {
        console.log("Received edit caption request");

        const post = await Post.findById(req.params.id);
        if (!post) {
            console.log("Post not found");
            return res.json({ success: false, message: "Post not found" });
        }

        const postAuthorId = post.author?.toString();
        const userId = req.id?.toString();

        if (postAuthorId !== userId) {
            console.log(`Unauthorized edit attempt by ${userId}, post belongs to ${postAuthorId}`);
            return res.json({ success: false, message: "Unauthorized" });
        }

        console.log("Editing caption to:", req.body.caption);
        post.caption = req.body.caption;
        await post.save();

        console.log("Caption updated successfully");
        res.json({ success: true, message: "Caption updated" });
    } catch (err) {
        console.error("editCaption error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username profilePicture')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePicture' }
            });

        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        res.json({ success: true, post });
    } catch (error) {
        console.error("getPostById error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;
        console.log("[Add Post] Caption:", caption);

        if (!image) return res.json({ success: false, message: "Image not found" });

        const optimisedImage = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 }).toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimisedImage.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        console.log("[Add Post] Image uploaded to Cloudinary:", cloudResponse.secure_url);

        const post = await Post.create({ caption, image: cloudResponse.secure_url, author: authorId });
        const user = await User.findById(authorId);

        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });
        console.log("[Add Post] Post Created:", post);

        // Notify followers
        const followers = await User.find({ following: authorId }).select('_id');
        followers.forEach(follower => {
            const followerSocketId = getReceiverSocketId ? getReceiverSocketId(follower._id) : null;
            if (io && followerSocketId) {
                console.log(`Emitting newPost notification to ${follower._id} at socket ${followerSocketId}`);
                io.to(followerSocketId).emit("newPost", {
                    type: "newPost",
                    postId: post._id,
                    userId: authorId,
                    message: `${user.username} created a new post`
                });
            }
        });

        return res.json({ success: true, message: "Post created successfully", post });
    } catch (error) {
        console.error("addNewPost error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const likePost = async (req, res) => {
    try {
        const likerId = req.id;
        const postId = req.params.id;

        console.log("[Like Post] PostId:", postId, "LikerId:", likerId);

        const post = await Post.findById(postId);
        if (!post) return res.json({ success: false, message: "Post not found" });

        if (post.likes.includes(likerId)) {
            return res.json({ success: false, message: "Already liked" });
        }

        post.likes.push(likerId);
        await post.save();

        // Notify post author
        if (post.author.toString() !== likerId.toString()) {
            await Notification.create({ sender: likerId, receiver: post.author, type: "like", post: postId });
            const senderDetails = await User.findById(likerId).select("username profilePicture");
            const authorSocketId = getReceiverSocketId ? getReceiverSocketId(post.author) : null;
            if (io && authorSocketId) {
                console.log(`Emitting like notification to ${post.author} at socket ${authorSocketId}`);
                io.to(authorSocketId).emit("notification", {
                    type: "like",
                    userId: likerId,
                    userDetails: senderDetails,
                    postId,
                    message: `${senderDetails.username} liked your post`
                });
            }
        }

        return res.json({ success: true, message: "Liked successfully" });
    } catch (error) {
        console.error("likePost error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const dislikePost = async (req, res) => {
    try {
        const dislikerId = req.id;
        const postId = req.params.id;

        console.log("[Dislike Post] PostId:", postId, "DislikerId:", dislikerId);

        const post = await Post.findById(postId);
        if (!post) return res.json({ success: false, message: "Post not found" });

        post.likes = post.likes.filter(id => id && id.toString() !== dislikerId.toString());
        await post.save();

        return res.json({ success: true, message: "Disliked" });
    } catch (error) {
        console.error("dislikePost error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const addComment = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const { text } = req.body;
        console.log("[Add Comment] postId:", postId, "Text:", text);

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Comment text is required",
            });
        }

        let comment = await Comment.create({
            text,
            author: req.user._id,
            post: postId,
        });

        comment = await comment.populate("author", "username profilePicture");

        const post = await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: comment._id } },
            { new: true }
        ).populate("author comments");

        // Notify post author
        if (post.author.toString() !== req.user._id.toString()) {
            await Notification.create({ sender: req.user._id, receiver: post.author, type: "comment", post: postId });
            const senderDetails = await User.findById(req.user._id).select("username profilePicture");
            const authorSocketId = getReceiverSocketId ? getReceiverSocketId(post.author) : null;
            if (io && authorSocketId) {
                console.log(`Emitting comment notification to ${post.author} at socket ${authorSocketId}`);
                io.to(authorSocketId).emit("notification", {
                    type: "comment",
                    userId: req.user._id,
                    userDetails: senderDetails,
                    postId,
                    message: `${senderDetails.username} commented on your post`
                });
            }
        }

        console.log("[Add Comment] New Comment:", comment);
        console.log("[Add Comment] Updated Post:", post);

        res.status(201).json({ success: true, comment, post });
    } catch (err) {
        console.error("addComment error:", err);
        res.status(500).json({ success: false, message: "Server error while adding comment" });
    }
};

export const bookmarkPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;
        console.log("[Bookmark] User:", userId, "Post:", postId);

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const isBookmarked = user.bookmarks.includes(postId);
        if (isBookmarked) {
            user.bookmarks.pull(postId);
            await user.save();
            console.log("[Bookmark] Removed Bookmark");
            return res.status(200).json({ success: true, message: "Bookmark removed" });
        } else {
            user.bookmarks.push(postId);
            await user.save();

            // Notify post author
            if (post.author.toString() !== userId.toString()) {
                await Notification.create({ sender: userId, receiver: post.author, type: "bookmark", post: postId });
                const senderDetails = await User.findById(userId).select("username profilePicture");
                const authorSocketId = getReceiverSocketId ? getReceiverSocketId(post.author) : null;
                if (io && authorSocketId) {
                    console.log(`Emitting bookmark notification to ${post.author} at socket ${authorSocketId}`);
                    io.to(authorSocketId).emit("notification", {
                        type: "bookmark",
                        userId,
                        userDetails: senderDetails,
                        postId,
                        message: `${senderDetails.username} bookmarked your post`
                    });
                }
            }

            console.log("[Bookmark] Added Bookmark");
            return res.status(200).json({ success: true, message: "Post bookmarked" });
        }
    } catch (error) {
        console.error("bookmarkPost error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};