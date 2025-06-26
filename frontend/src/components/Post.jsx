import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogOverlay,
} from '@radix-ui/react-dialog';
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
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
        if (user && Array.isArray(user.bookmarks)) {
            setIsBookmarked(user.bookmarks.includes(post._id));
        } else {
            setIsBookmarked(false);
        }
    }, [user, post._id]);

    const changeEventHandler = (e) => {
        setText(e.target.value);
    };

    const commentHandler = async () => {
        if (!text.trim()) return;
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/post/${post._id}/comment`,
                { text },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );

            if (res.data.success) {
                console.log("[Comment] Added:", res.data.comment);
                const updatedPostRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/post/${post._id}`,
                    { withCredentials: true }
                );
                const updatedPost = updatedPostRes.data.post;
                dispatch(setPosts(posts.map(p => p._id === post._id ? updatedPost : p)));
                dispatch(setSelectedPost(updatedPost));
                setText('');
                toast.success("Comment added");
            }
        } catch (err) {
            console.error("[Comment] Failed:", err);
            toast.error(err?.response?.data?.message || "Failed to comment");
        }
    };

    const toggleBookmarkHandler = async () => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/post/${post._id}/bookmark`,
                {},
                { withCredentials: true }
            );

            if (!res.data.success) {
                console.warn("[Bookmark] Error:", res.data);
                return toast.error(res.data.message || "Failed to update bookmark");
            }

            const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
                withCredentials: true
            });

            if (userRes.data.success) {
                const updatedUser = userRes.data.user;
                dispatch(setAuthUser(updatedUser));
                setIsBookmarked(Array.isArray(updatedUser.bookmarks) && updatedUser.bookmarks.includes(post._id));
                console.log("[Bookmark] Updated user bookmarks");
            }

            toast.success(res.data.message);
        } catch (err) {
            console.error("[Bookmark] Failed:", err);
            toast.error(err?.response?.data?.message || "Bookmark failed");
        }
    };

    const likeDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            console.log(`${liked ? '💔 Unliking' : '❤️ Liking'} post:`, post._id);

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/post/${post._id}/${action}`,
                {},
                { withCredentials: true }
            );

            if (res.data.success) {
                console.log("✅ Like/Dislike updated:", res.data.message);
                const updatedPostRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/post/${post._id}`,
                    { withCredentials: true }
                );
                const updatedPost = updatedPostRes.data.post;
                dispatch(setPosts(posts.map(p => p._id === post._id ? updatedPost : p)));
                dispatch(setSelectedPost(updatedPost));
                setPostLike(updatedPost.likes.length);
                setLiked(!liked);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error("❌ Like/Dislike failed:", error);
            toast.error(error?.response?.data?.message || "Failed to update like/dislike");
        }
    };

    const fetchFollowings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/followings`, {
                withCredentials: true,
            });
            setFollowings(res.data.followings || []);
            console.log("[Share] Loaded followings:", res.data.followings);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load followings");
            console.error("[Share] Error loading followings:", error);
        }
    };

    const handleSharePost = async (receiverId) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/message/send/${receiverId}`, {
                message: `Check out this post!`,
                postId: post._id,
            }, { withCredentials: true });

            toast.success("Post shared!");
            setShareOpen(false);
        } catch (err) {
            console.error("[Share] Failed to send post:", err);
            toast.error(err?.response?.data?.message || "Failed to share");
        }
    };

    useEffect(() => {
        if (shareOpen) fetchFollowings();
    }, [shareOpen]);

    return (
        <div className='my-8 w-full max-w-md mx-auto rounded-2xl bg-[#1e1e1e] shadow-[0_4px_20px_rgba(0,0,0,0.6)] p-4'>
            <div className='flex items-center justify-between'>
                <div className="flex items-center gap-2">
                    <Avatar>
                        <Link to={`/profile/${post.author._id}`}>
                            <AvatarImage className='h-10 w-10 rounded-full' src={post.author.profilePicture} alt='Post_Image' />
                            <AvatarFallback>{post.author.username[0]}</AvatarFallback>
                        </Link>
                    </Avatar>
                    <Link to={`/profile/${post.author._id}`}>
                        <h1>{post.author.username}</h1>
                    </Link>
                </div>
            </div>
            <img
                onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }}
                className='rounded-sm my-2 w-full aspect-square object-cover cursor-pointer'
                src={post.image}
                alt="post_image"
            />
            <div className="flex items-center justify-between">
                <div className='flex items-center gap-3'>
                    {liked ? (
                        <FaHeart onClick={likeDislikeHandler} size={24} className='cursor-pointer text-red-600' />
                    ) : (
                        <FaRegHeart onClick={likeDislikeHandler} size={22} className='cursor-pointer text-white' />
                    )}
                    <MessageCircle
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                        className='cursor-pointer hover:text-gray-400'
                    />
                    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                        <DialogTrigger asChild>
                            <Send className='cursor-pointer hover:text-gray-400' />
                        </DialogTrigger>
                        <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg bg-[#1e1e1e] p-6 shadow-xl focus:outline-none z-50">
                            <h2 className="text-xl font-semibold text-white mb-4">Share Post</h2>
                            <input
                                type="text"
                                placeholder="Search by username..."
                                className="w-full p-2 mb-4 rounded-md border border-gray-600 bg-transparent text-white placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {filteredFollowings.length === 0 ? (
                                <p className="text-gray-400">No users found</p>
                            ) : (
                                <div className="max-h-64 overflow-y-auto space-y-3">
                                    {filteredFollowings.map((user) => (
                                        <div key={user._id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage className='h-12 w-12' src={user.profilePicture} />
                                                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-white">{user.username}</span>
                                            </div>
                                            <Button className='cursor-pointer' size="sm" onClick={() => handleSharePost(user._id)}>
                                                Send
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
                <Bookmark
                    onClick={toggleBookmarkHandler}
                    className={`cursor-pointer hover:text-gray-600 ${isBookmarked ? 'fill-white text-white' : 'text-gray-400'}`}
                />
            </div>
            <span className='font-medium block mb-2 text-white'>{postLike} likes</span>
            <p className='text-white'>
                <Link to={`/profile/${post.author._id}`}>
                    <span className='font-medium mr-2'>{post.author.username}</span>
                </Link>
                {post.caption}
            </p>
            {post.comments.length > 0 ? (
                <span className='cursor-pointer text-sm text-gray-400' onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }}>View all {post.comments.length} comments</span>
            ) : (
                <span className='cursor-pointer text-sm text-gray-400' onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }}>Be first to comment</span>
            )}
            <CommentDialog open={open} setOpen={setOpen} />
            <div className='flex items-center justify-between mt-2'>
                <input
                    type="text"
                    value={text}
                    onChange={changeEventHandler}
                    placeholder='Add a comment'
                    className='outline-none text-sm w-full bg-transparent text-white border-b border-gray-600 py-1'
                />
            </div>
            {text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>}
        </div>
    );
};

export default Post;