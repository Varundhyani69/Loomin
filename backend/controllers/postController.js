import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Comment from "../models/commentModel.js";
import { io, getReceiverSocketId } from "../socket/socket.js";
import Notification from "../models/notificationModel.js";


export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;
        if (!image) return res.json({ success: false, message: "Image not found" });

        const optimisedImage = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 }).toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimisedImage.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        const post = await Post.create({ caption, image: cloudResponse.secure_url, author: authorId });
        const user = await User.findById(authorId);

        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.json({ success: true, message: "Post created successfully", post });
    } catch (error) {
        console.log(error);
    }
};

export const likePost = async (req, res) => {
    try {
        const likerId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.json({ success: false, message: "Post not found" });

        if (post.likes.includes(likerId)) {
            return res.json({ success: false, message: "Already liked" });
        }

        post.likes.push(likerId);
        await post.save();

        const user = await User.findById(likerId).select('username profilePicture');
        const postOwnerId = post.author.toString();

        if (postOwnerId !== likerId) {
            const notification = {
                type: 'like',
                userId: likerId,
                userDetails: user,
                postId,
                message: `${user.username} liked your post`
            };

            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            if (postOwnerSocketId) {
                io.to(postOwnerSocketId).emit('notification', notification);
            }

            await Notification.create({ sender: likerId, receiver: postOwnerId, type: 'like' });
        }

        return res.json({ success: true, message: "Liked successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const dislikePost = async (req, res) => {
    try {
        const dislikerId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.json({ success: false, message: "post not found" });

        await Post.updateOne({ _id: postId }, { $pull: { likes: dislikerId } });
        await post.save();

        return res.json({ success: true, message: "Disliked" });
    } catch (error) {
        console.log(error);
    }
};

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commenter = req.id;
        const { text } = req.body;
        const post = await Post.findById(postId);
        if (!text) return res.json({ message: "text is required", success: false });

        const comment = await Comment.create({ text, author: commenter, post: postId });
        await comment.populate({ path: 'author', select: "username profilePicture" });

        post.comments.push(comment._id);
        await post.save();

        const postOwnerId = post.author.toString();
        if (postOwnerId !== commenter) {
            const user = await User.findById(commenter).select('username profilePicture');
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);

            if (postOwnerSocketId) {
                io.to(postOwnerSocketId).emit('notification', {
                    type: 'comment',
                    userId: commenter,
                    userDetails: user,
                    postId,
                    message: `${user.username} commented on your post`
                });
            }

            await Notification.create({ sender: commenter, receiver: postOwnerId, type: 'comment' });
        }

        return res.json({ success: true, message: "comment added", comment });
    } catch (error) {
        console.log(error);
    }
};

export const getFollowingPosts = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser || !currentUser.following) {
            return res.status(400).json({ success: false, message: "Invalid user or no following list" });
        }

        const posts = await Post.find({ author: { $in: currentUser.following } })
            .populate("author", "username profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, posts });
    } catch (error) {
        console.error("Error in getFollowingPosts:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};





export const getAllPost = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        const followingIds = user.following;
        const posts = await Post.find({ author: { $in: followingIds } })
            .populate("author", "username profilePicture")
            .sort({ createdAt: -1 });
        return res.json({
            success: true,
            post
        })
    } catch (error) {
        console.log(error);
    }
}

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 }
                .populate({
                    path: 'author',
                    select: 'username profilePicture' // ✅ no comma
                })


        });
        return res.json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}





export const getComments = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ post: postId }).populate('author', 'username profilePicture');
        if (!comments) {
            return res.json({
                success: false,
                message: "No comments found"
            })
        };
        return res.json({
            success: true,
            message: "Comments found",
            comments
        })

    } catch (error) {
        console.log(error);
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const posts = await Post.findById(postId);
        if (!posts) return res.json({ message: "No Posts", success: false });

        if (posts.author.toString() !== authorId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        await Post.findByIdAndDelete(postId);

        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        await Comment.deleteMany({ post: postId });

        return res.json({
            success: true,
            message: "Post deleted"
        });
    } catch (error) {
        console.log(error);
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;
        console.log({ userId, postId });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const isBookmarked = user.bookmarks.includes(postId);

        if (isBookmarked) {
            // remove bookmark
            user.bookmarks.pull(postId);
            await user.save();
            return res.status(200).json({ success: true, message: "Bookmark removed" });
        } else {
            // add bookmark
            user.bookmarks.push(postId);
            await user.save();
            return res.status(200).json({ success: true, message: "Post bookmarked" });
        }

    } catch (error) {
        console.error("Bookmark Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const editCaption = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.json({ success: false, message: "Post not found" });

        if (post.author.toString() !== req.id)
            return res.json({ success: false, message: "Unauthorized" });

        post.caption = req.body.caption;
        await post.save();

        res.json({ success: true, message: "Caption updated" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Something went wrong" });
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
        console.log(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};
