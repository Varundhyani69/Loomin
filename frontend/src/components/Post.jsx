import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Dialog, DialogTrigger, DialogContent, DialogOverlay } from '@radix-ui/react-dialog';
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { Link } from 'react-router-dom';

const Post = ({ post }) => {
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const dispatch = useDispatch();

    const [text, setText] = useState('');
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState(post.comments);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [liked, setLiked] = useState(post.likes.includes(user?._id));
    const [isFollowing, setIsFollowing] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [followings, setFollowings] = useState([]);

    useEffect(() => {
        setIsFollowing(post?.author?.followers?.includes(user?._id));
        setIsBookmarked(user?.bookmarks?.includes(post._id));
    }, [post, user]);

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        setText(inputText.trim() ? inputText : '');
    };

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`http://localhost:8080/api/v1/post/delete/${post?._id}`, { withCredentials: true });
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    const likeDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.post(`http://localhost:8080/api/v1/post/${post._id}/${action}`, {}, { withCredentials: true });

            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);
                const updatedPostData = posts.map((p) => p._id === post._id
                    ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    }
                    : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error("Like/Dislike failed");
        }
    };

    const commentHandler = async () => {
        try {
            const res = await axios.post(
                `http://localhost:8080/api/v1/post/${post._id}/comment`,
                { text },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Comment failed");
        }
    };

    const followUnfollowHandler = async () => {
        if (!user) return toast.error("Please log in to follow/unfollow");

        try {
            const res = await axios.post(
                `http://localhost:8080/api/v1/user/followorunfollow/${post.author._id}`,
                {},
                { withCredentials: true }
            );
            if (!res.data.success) return toast.error(res.data.message);
            toast.success(res.data.message);
            setIsFollowing(prev => !prev);
        } catch (err) {
            toast.error("Follow/Unfollow failed");
        }
    };

    const toggleBookmarkHandler = async () => {
        try {
            const res = await axios.post(`http://localhost:8080/api/v1/post/${post?._id}/bookmark`, {}, { withCredentials: true });

            if (res.data.success) {
                setIsBookmarked(prev => !prev);
                toast.success(res.data.message);
                window.dispatchEvent(new Event("refreshProfile"));
            }
        } catch (err) {
            toast.error("Bookmark failed");
        }
    };

    const fetchFollowings = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/v1/user/followings", { withCredentials: true });
            setFollowings(res.data.followings || []);
        } catch (error) {
            toast.error("Failed to load followings");
        }
    };

    useEffect(() => {
        if (shareOpen) fetchFollowings();
    }, [shareOpen]);

    const handleSharePost = async (receiverId) => {
        try {
            await axios.post(`http://localhost:8080/api/v1/message/send/${receiverId}`, {
                message: `Check out this post!`,
                postId: post._id
            }, { withCredentials: true });

            toast.success("Post shared!");
            setShareOpen(false);
        } catch (err) {
            toast.error("Failed to share");
        }
    };

    return (
        <div className='my-8 ml-150 w-full max-w-sm mx-auto'>
            <div className='flex items-center justify-between'>
                <div className="flex items-center gap-2">
                    <Avatar>
                        <Link to={`/profile/${post.author._id}`}>
                            <AvatarImage className='h-10 w-10 rounded-full' src={post.author.profilePicture} alt='Post_Image' />
                            <AvatarFallback>CN</AvatarFallback>
                        </Link>
                    </Avatar>
                    <Link to={`/profile/${post.author._id}`}>
                        <h1>{post.author.username}</h1>
                    </Link>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer' />
                    </DialogTrigger>
                    <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                    <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 rounded-md bg-white p-6 shadow-xl focus:outline-none z-50">
                        <div className="flex flex-col items-center gap-2 text-sm text-center">
                            <Button onClick={followUnfollowHandler} className={`h-8 text-sm ${!isFollowing ? 'bg-gray-200 text-black' : 'bg-[#0095F6] text-white'}`}>
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </Button>
                            <Button variant="ghost" onClick={toggleBookmarkHandler}>
                                {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                            </Button>
                            {user?._id === post?.author._id && (
                                <Button variant="ghost" onClick={deletePostHandler}>Delete</Button>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
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
                        <FaRegHeart className='cursor-pointer' onClick={likeDislikeHandler} size={22} />
                    )}
                    <MessageCircle onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer hover:text-gray-600' />

                    {/* Share Dialog */}
                    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                        <DialogTrigger asChild>
                            <Send className='cursor-pointer hover:text-gray-600' />
                        </DialogTrigger>
                        <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 rounded-md bg-white p-6 shadow-xl focus:outline-none z-50">
                            <h2 className='text-lg font-bold mb-4'>Share Post</h2>
                            {followings.length === 0 ? (
                                <p className='text-gray-500'>You're not following anyone.</p>
                            ) : (
                                <div className='flex flex-col gap-2 max-h-64 overflow-y-auto'>
                                    {followings.map(f => (
                                        <div key={f._id} className='flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <Avatar><AvatarImage className='h-12 w-12 rounded-full' src={f.profilePicture} /><AvatarFallback>CN</AvatarFallback></Avatar>
                                                <span>{f.username}</span>
                                            </div>
                                            <Button onClick={() => handleSharePost(f._id)} size="sm">Send</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>

                <Bookmark
                    onClick={toggleBookmarkHandler}
                    className={`cursor-pointer hover:text-gray-600 ${isBookmarked ? 'fill-black' : ''}`}
                />
            </div>

            <span className='font-medium block mb-2'>{postLike} likes</span>

            <p>
                <Link to={`/profile/${post.author._id}`}>
                    <span className='font-medium mr-2'>{post.author.username}</span>
                </Link>
                {post.caption}
            </p>

            {comment.length > 0 ? (
                <span className='cursor-pointer text-sm text-gray-400' onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }}>View all {comment.length} comments</span>
            ) : (
                <span className='cursor-pointer text-sm text-gray-400' onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }}>Be first to comment</span>
            )}

            <CommentDialog open={open} setOpen={setOpen} comment={comment} />

            <div className='flex items-center justify-between'>
                <input
                    type="text"
                    value={text}
                    onChange={changeEventHandler}
                    placeholder='Add a comment'
                    className='outline-none text-sm w-full'
                />
            </div>

            {text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>}
        </div>
    );
};

export default Post;
