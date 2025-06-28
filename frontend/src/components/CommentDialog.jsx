import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Dialog, DialogContent, DialogOverlay, DialogTrigger } from "@radix-ui/react-dialog";
import { MoreHorizontal, Trash2, Pencil, MessageCircle, Send, Bookmark } from "lucide-react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Comment from "./Comment.jsx";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://loomin-backend-production.up.railway.app";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [followings, setFollowings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { selectedPost, posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (selectedPost && user) {
      setLiked(selectedPost.likes.includes(user._id));
      setLikesCount(selectedPost.likes.length);
      setIsBookmarked(user?.bookmarks?.includes(selectedPost._id));
    }
  }, [selectedPost, user]);

  const isPostAuthor = () => {
    if (!selectedPost || !user) return false;
    const authorId = typeof selectedPost.author === "string" ? selectedPost.author : selectedPost.author?._id;
    return user._id?.toString() === authorId?.toString();
  };

  const likeDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.post(`${API_BASE_URL}/post/${selectedPost._id}/${action}`, {}, { withCredentials: true });
      if (res.data.success) {
        const updatedPostRes = await axios.get(`${API_BASE_URL}/post/${selectedPost._id}`, { withCredentials: true });
        const updatedPost = updatedPostRes.data.post;
        dispatch(setSelectedPost(updatedPost));
        dispatch(setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p)));
        setLikesCount(updatedPost.likes.length);
        setLiked(!liked);
      }
    } catch (error) {
      toast.error("Like/Dislike failed");
    }
  };

  const toggleBookmarkHandler = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/post/${selectedPost._id}/bookmark`, {}, { withCredentials: true });
      if (res.data.success) {
        const userRes = await axios.get(`${API_BASE_URL}/user/profile`, { withCredentials: true });
        if (userRes.data.success) {
          dispatch(setAuthUser(userRes.data.user));
          setIsBookmarked(userRes.data.user.bookmarks.includes(selectedPost._id));
        }
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error("Bookmark failed");
    }
  };

  const updateCaptionHandler = async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/post/${selectedPost._id}/edit-caption`, { caption: editedCaption }, { withCredentials: true });
      if (res.data.success) {
        const getRes = await axios.get(`${API_BASE_URL}/post/${selectedPost._id}`, { withCredentials: true });
        const updatedPost = getRes.data.post;
        dispatch(setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p)));
        dispatch(setSelectedPost(updatedPost));
        dispatch((dispatch, getState) => {
          const { auth } = getState();
          const updatedUserProfilePosts = auth.userProfile?.posts?.map(p => p._id === updatedPost._id ? updatedPost : p);
          dispatch(setUserProfile({ ...auth.userProfile, posts: updatedUserProfilePosts }));
        });
        toast.success("Caption updated");
        setIsEditing(false);
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/post/delete/${selectedPost._id}`, { withCredentials: true });
      if (res.data.success) {
        dispatch(setPosts(posts.filter(p => p._id !== selectedPost._id)));
        dispatch((dispatch, getState) => {
          const { auth } = getState();
          const updatedUserProfilePosts = auth.userProfile?.posts?.filter(p => p._id !== selectedPost._id);
          dispatch(setUserProfile({ ...auth.userProfile, posts: updatedUserProfilePosts }));
        });
        toast.success("Post deleted");
        setOpen(false);
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    if (shareOpen) {
      axios.get(`${API_BASE_URL}/user/followings`, { withCredentials: true })
        .then(res => setFollowings(res.data.followings || []))
        .catch(() => toast.error("Failed to load followings"));
    }
  }, [shareOpen]);

  const handleSharePost = async (receiverId) => {
    try {
      await axios.post(`${API_BASE_URL}/message/send/${receiverId}`, {
        message: "Check this post!",
        postId: selectedPost._id,
      }, { withCredentials: true });
      toast.success("Post shared!");
      setShareOpen(false);
    } catch (err) {
      toast.error("Failed to share post");
    }
  };

  const filteredFollowings = followings.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[90vh] overflow-hidden p-0 bg-[#1e1e1e] text-white rounded-xl shadow-2xl z-50">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/2 h-64 md:h-full">
            <img className="w-full h-full object-contain md:object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none" src={selectedPost?.image || ""} alt="post_img" />
          </div>
          <div className="w-full md:w-1/2 flex flex-col p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage className="h-10 w-10 rounded-full" src={selectedPost?.author?.profilePicture || ""} />
                  <AvatarFallback>{selectedPost?.author?.username?.[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{selectedPost?.author?.username}</span>
              </div>
              {isPostAuthor() && (
                <div className="relative group">
                  <MoreHorizontal className="cursor-pointer" />
                  <div className="absolute right-0 top-6 bg-[#2a2a2a] text-white border border-gray-700 rounded-md p-2 hidden group-hover:block z-50 text-sm min-w-[150px]">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditedCaption(selectedPost.caption || "");
                      }}
                      className="flex items-center w-full text-left px-3 py-1 hover:bg-[#3a3a3a] rounded"
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Edit Caption
                    </button>
                    <button
                      onClick={deletePostHandler}
                      className="flex items-center w-full text-left px-3 py-1 hover:bg-[#3a3a3a] rounded text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Post
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#2a2a2a] border border-gray-600 text-white"
                />
                <Button onClick={updateCaptionHandler} size="sm">Save</Button>
              </div>
            ) : (
              <p className="text-sm text-gray-300 mb-4">{selectedPost?.caption}</p>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 mb-4 custom-scroll">
              {selectedPost?.comments?.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>

            <div className="mt-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  {liked ? (
                    <FaHeart onClick={likeDislikeHandler} className="text-red-600 cursor-pointer" size={20} />
                  ) : (
                    <FaRegHeart onClick={likeDislikeHandler} className="text-white cursor-pointer" size={20} />
                  )}
                  <MessageCircle className="text-white cursor-pointer" size={20} />
                  <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                    <DialogTrigger asChild>
                      <Send className="text-white cursor-pointer" size={20} />
                    </DialogTrigger>
                    <DialogOverlay className="fixed inset-0 bg-black/40 z-50" />
                    <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1e1e1e] text-white p-6 w-full max-w-md rounded-lg z-50">
                      <h2 className="text-lg font-semibold mb-4">Share Post</h2>
                      <input
                        type="text"
                        placeholder="Search followings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 mb-4 bg-[#2a2a2a] border border-gray-600 rounded text-white"
                      />
                      <div className="max-h-64 overflow-y-auto space-y-3">
                        {filteredFollowings.length === 0 ? (
                          <p className="text-gray-400">No users found</p>
                        ) : (
                          filteredFollowings.map((user) => (
                            <div key={user._id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage className='h-10 w-10' src={user.profilePicture} />
                                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                                </Avatar>
                                <span>{user.username}</span>
                              </div>
                              <Button size="sm" onClick={() => handleSharePost(user._id)}>
                                Send
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Bookmark
                  onClick={toggleBookmarkHandler}
                  className={`cursor-pointer hover:text-gray-600 ${isBookmarked ? 'fill-white text-white' : 'text-gray-400'}`}
                  size={20}
                />
              </div>

              <div className="text-sm text-gray-300 mb-2">{likesCount} likes</div>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 bg-[#2a2a2a] text-white rounded border border-gray-600 focus:outline-none"
                />
                <Button onClick={sentMessageHandler} disabled={!text.trim()} className="cursor-pointer" variant="secondary">
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
