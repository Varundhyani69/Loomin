import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
} from '@radix-ui/react-dialog';
import { Bookmark, MessageCircle } from 'lucide-react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import CommentDialog from './CommentDialog';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { setAuthUser } from '@/redux/authSlice';

const Post = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);

  // Early return if post is invalid
  if (!post || !post.author) return null;

  const postId = post._id;
  const author = post.author;
  const likesArr = Array.isArray(post.likes) ? post.likes : [];
  const commentsArr = Array.isArray(post.comments) ? post.comments : [];

  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [postLike, setPostLike] = useState(likesArr.length);
  const [liked, setLiked] = useState(likesArr.includes(user?._id));
  const [isBookmarked, setIsBookmarked] = useState(
    user?.bookmarks?.includes(postId) ?? false
  );
  const [shareOpen, setShareOpen] = useState(false);
  const [followings, setFollowings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFollowings = followings.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setIsBookmarked(user?.bookmarks?.includes(postId) ?? false);
  }, [user?.bookmarks, postId]);

  const changeEventHandler = (e) => setText(e.target.value);

  // ... [rest of handlers remain same, referencing safe variables]

  const likeDislikeHandler = async () => {
    try {
      const action = liked ? 'dislike' : 'like';
      const res = await axios.post(
        `/api/v1/post/${postId}/${action}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        const resp = await axios.get(`/api/v1/post/${postId}`, {
          withCredentials: true,
        });
        const updatedPost = resp.data.post;
        dispatch(
          setPosts(posts.map((p) => (p._id === postId ? updatedPost : p)))
        );
        dispatch(setSelectedPost(updatedPost));

        const updatedLikes = Array.isArray(updatedPost.likes)
          ? updatedPost.likes.length
          : 0;
        setPostLike(updatedLikes);
        setLiked(!liked);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update like status');
    }
  };

  // share, comment, bookmark handlers safely reference postId...

  return (
    <div className="my-8 max-w-md mx-auto bg-[#1e1e1e] rounded-2xl p-4 shadow-lg">
      {/* header */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar>
          <Link to={`/profile/${author._id}`}>
            <AvatarImage
              className="h-10 w-10 rounded-full"
              src={author.profilePicture}
              alt={author.username}
            />
            <AvatarFallback>{author.username[0]}</AvatarFallback>
          </Link>
        </Avatar>
        <Link to={`/profile/${author._id}`}>
          <span className="font-semibold">{author.username}</span>
        </Link>
      </div>

      {/* image */}
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="w-full aspect-square object-cover rounded-md cursor-pointer mb-3"
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
        />
      )}

      {/* actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          {liked ? (
            <FaHeart
              onClick={likeDislikeHandler}
              className="text-red-600 cursor-pointer"
            />
          ) : (
            <FaRegHeart
              onClick={likeDislikeHandler}
              className="text-white cursor-pointer"
            />
          )}
          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer"
          />
          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
              <Send className="cursor-pointer" />
            </DialogTrigger>
            {/* share dialog content */}
          </Dialog>
        </div>
        <Bookmark
          onClick={toggleBookmarkHandler}
          className={`cursor-pointer ${isBookmarked ? 'fill-white text-white' : 'text-gray-400'
            }`}
        />
      </div>

      <span className="block mb-2 font-medium">{postLike} likes</span>

      <p className="mb-2">
        <Link to={`/profile/${author._id}`}>
          <span className="font-semibold mr-2">{author.username}</span>
        </Link>
        {post.caption}
      </p>

      {commentsArr.length > 0 && (
        <span
          className="text-sm text-gray-400 cursor-pointer"
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
        >
          View all {commentsArr.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />

      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={changeEventHandler}
          placeholder="Add a comment"
          className="flex-1 bg-transparent text-white border-b border-gray-600 py-1 focus:outline-none"
        />
        {text.trim() && (
          <span
            onClick={commentHandler}
            className="text-[#3BADF8] cursor-pointer"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
