import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogOverlay,
} from '@radix-ui/react-dialog';
import { Bookmark, MessageCircle, Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { setAuthUser } from '@/redux/authSlice';
import { Link } from 'react-router-dom';

const Post = ({ post }) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const dispatch = useDispatch();

    const [text, setText] = useState('');
    const [open, setOpen] = useState(false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [liked, setLiked] = useState(post.likes.includes(user?._id));
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [followings, setFollowings] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFollowings = followings.filter((f) =>
        f.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (user?.bookmarks) {
            setIsBookmarked(user.bookmarks.includes(post._id));
        }
    }, [user, post._id]);

    const commentHandler = async () => {
        if (!text.trim()) return;
        try {
            const res = await axios.post(
                `${API_BASE_URL}/post/${post._id}/comment`,
                { text },
                { withCredentials: true }
            );
            if (res.data.success) {
                const updatedPostRes = await axios.get(`${API_BASE_URL}/post/${post._id}`, { withCredentials: true });
                const updatedPost = updatedPostRes.data.post;
                dispatch(setPosts(posts.map(p => p._id === post._id ? updatedPost : p)));
                dispatch(setSelectedPost(updatedPost));
                setText('');
                toast.success("Comment added");
            }
        } catch {
            toast.error("Failed to comment");
        }
    };

    const toggleBookmarkHandler = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/post/${post._id}/bookmark`, {}, { withCredentials: true });
            if (res.data.success) {
                const userRes = await axios.get(`${API_BASE_URL}/user/profile`, { withCredentials: true });
                if (userRes.data.success) {
                    dispatch(setAuthUser(userRes.data.user));
                    setIsBookmarked(userRes.data.user.bookmarks.includes(post._id));
                }
                toast.success(res.data.message);
            }
        } catch {
            toast.error("Bookmark failed");
        }
    };

    const likeDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.post(`${API_BASE_URL}/post/${post._id}/${action}`, {}, { withCredentials: true });
            if (res.data.success) {
                const updatedPostRes = await axios.get(`${API_BASE_URL}/post/${post._id}`, { withCredentials: true });
                const updatedPost = updatedPostRes.data.post;
                dispatch(setPosts(posts.map(p => p._id === post._id ? updatedPost : p)));
                dispatch(setSelectedPost(updatedPost));
                setPostLike(updatedPost.likes.length);
                setLiked(!liked);
            }
        } catch {
            toast.error("Failed to update like/dislike");
        }
    };

    const fetchFollowings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/user/followings`, { withCredentials: true });
            setFollowings(res.data.followings || []);
        } catch {
            toast.error("Failed to load followings");
        }
    };

    const handleSharePost = async (receiverId) => {
        try {
            await axios.post(`${API_BASE_URL}/message/send/${receiverId}`, {
                message: `Check out this post!`,
                postId: post._id,
            }, { withCredentials: true });
            toast.success("Post shared!");
            setShareOpen(false);
        } catch {
            toast.error("Failed to share");
        }
    };

    useEffect(() => {
        if (shareOpen) fetchFollowings();
    }, [shareOpen]);

    return (
        <div className="my-6 w-full max-w-md mx-auto rounded-2xl bg-[#1e1e1e] shadow-lg p-4">
            {/* Top Bar */}
            <div className="flex items-center gap-2 mb-2">
                <Avatar>
                    <Link to={`/profile/${post.author._id}`}>
                        <AvatarImage className="h-10 w-10 rounded-full" src={post.author.profilePicture} />
                        <AvatarFallback>{post.author.username[0]}</AvatarFallback>
                    </Link>
                </Avatar>
                <Link to={`/profile/${post.author._id}`}>
                    <h1 className="font-semibold">{post.author.username}</h1>
                </Link>
            </div>

            {/* Post Image */}
            <img
                onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }}
                className="rounded-md my-2 w-full aspect-square object-cover cursor-pointer"
                src={post.image}
                alt="Post"
            />

            {/* Actions */}
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                    {liked ? (
                        <FaHeart onClick={likeDislikeHandler} className="text-red-600 cursor-pointer" />
                    ) : (
                        <FaRegHeart onClick={likeDislikeHandler} className="text-white cursor-pointer" />
                    )}
                    <MessageCircle
                        className="text-white cursor-pointer hover:text-gray-400"
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                    />
                    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                        <DialogTrigger asChild>
                            <Send className="cursor-pointer hover:text-gray-400" />
                        </DialogTrigger>
                        <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
                        <DialogContent className="bg-[#1e1e1e] text-white rounded-lg p-6 shadow-xl max-w-sm mx-auto z-50">
                            <h2 className="text-xl font-semibold mb-4">Share Post</h2>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search username..."
                                className="w-full p-2 mb-4 bg-[#2a2a2a] border border-gray-600 rounded-md text-white"
                            />
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {filteredFollowings.length === 0 ? (
                                    <p className="text-sm text-gray-400">No users found</p>
                                ) : (
                                    filteredFollowings.map((u) => (
                                        <div key={u._id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage className="h-8 w-8" src={u.profilePicture} />
                                                    <AvatarFallback>{u.username[0]}</AvatarFallback>
                                                </Avatar>
                                                <span>{u.username}</span>
                                            </div>
                                            <Button size="sm" onClick={() => handleSharePost(u._id)}>Send</Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <Bookmark
                    onClick={toggleBookmarkHandler}
                    className={`cursor-pointer ${isBookmarked ? "fill-white text-white" : "text-gray-400"}`}
                />
            </div>

            {/* Likes */}
            <span className="block mt-2 font-medium text-white">{postLike} likes</span>

            {/* Caption */}
            <p className="text-white">
                <Link to={`/profile/${post.author._id}`} className="font-medium mr-2">{post.author.username}</Link>
                {post.caption}
            </p>

            {/* Comments */}
            <span
                onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }}
                className="text-sm text-gray-400 cursor-pointer"
            >
                {post.comments.length > 0 ? `View all ${post.comments.length} comments` : "Be first to comment"}
            </span>

            <CommentDialog open={open} setOpen={setOpen} />

            {/* Add comment */}
            <div className="flex items-center gap-2 mt-2">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full text-sm bg-transparent border-b border-gray-600 text-white outline-none"
                />
                {text && (
                    <span onClick={commentHandler} className="text-[#3BADF8] cursor-pointer text-sm font-medium">
                        Post
                    </span>
                )}
            </div>
        </div>
    );
};

export default Post;
