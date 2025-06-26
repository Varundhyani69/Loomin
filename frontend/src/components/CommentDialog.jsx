import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Dialog, DialogContent, DialogOverlay } from "@radix-ui/react-dialog";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Comment from "./Comment.jsx";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { setUserProfile } from "@/redux/authSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://loomin-backend-production.up.railway.app";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const isPostAuthor = () => {
    if (!selectedPost || !user) return false;
    const authorId = typeof selectedPost.author === "string" ? selectedPost.author : selectedPost.author?._id;
    return user._id?.toString() === authorId?.toString();
  };

  const sentMessageHandler = async () => {
    if (!text.trim()) return;
    try {
      console.log("💬 [Add Comment] Sending:", text);
      const res = await axios.post(
        `${API_BASE_URL}/post/${selectedPost._id}/comment`,
        { text },
        { withCredentials: true }
      );

      if (res.data.success) {
        console.log("✅ [Add Comment] Added:", res.data.comment);
        const getUpdatedPost = await axios.get(
          `${API_BASE_URL}/post/${selectedPost._id}`,
          { withCredentials: true }
        );
        const updatedPost = getUpdatedPost.data.post;

        const updatedPosts = posts.map((p) =>
          p._id === selectedPost._id ? updatedPost : p
        );
        dispatch(setPosts(updatedPosts));
        dispatch(setSelectedPost(updatedPost));
        setText("");
        toast.success("Comment added");
      }
    } catch (err) {
      console.error("❌ [Add Comment] Failed:", err);
      toast.error("Failed to post comment");
    }
  };

  const deletePostHandler = async () => {
    try {
      console.log("🗑️ [Delete Post] ID:", selectedPost._id);
      const res = await axios.delete(
        `${API_BASE_URL}/post/delete/${selectedPost._id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        console.log("✅ [Delete Post] Success");
        dispatch(setPosts(posts.filter((p) => p._id !== selectedPost._id)));
        dispatch((dispatch, getState) => {
          const { auth } = getState();
          const updatedUserProfilePosts = auth.userProfile?.posts?.filter((p) => p._id !== selectedPost._id);
          dispatch(setUserProfile({ ...auth.userProfile, posts: updatedUserProfilePosts }));
        });
        toast.success("Post deleted");
        setOpen(false);
      }
    } catch (err) {
      console.error("❌ [Delete Post] Failed:", err);
      toast.error("Delete failed");
    }
  };

  const updateCaptionHandler = async () => {
    try {
      console.log("✏️ [Edit Caption] New:", editedCaption);
      const res = await axios.put(
        `${API_BASE_URL}/post/${selectedPost._id}/edit-caption`,
        { caption: editedCaption },
        { withCredentials: true }
      );

      if (res.data.success) {
        const getRes = await axios.get(`${API_BASE_URL}/post/${selectedPost._id}`, {
          withCredentials: true,
        });
        const updatedPost = getRes.data.post;

        console.log("✅ [Edit Caption] Updated post:", updatedPost);
        const updatedPosts = posts.map((p) => (p._id === updatedPost._id ? updatedPost : p));
        dispatch(setPosts(updatedPosts));
        dispatch(setSelectedPost(updatedPost));
        dispatch((dispatch, getState) => {
          const { auth } = getState();
          const updatedUserProfilePosts = auth.userProfile?.posts?.map((p) =>
            p._id === updatedPost._id ? updatedPost : p
          );
          dispatch(setUserProfile({ ...auth.userProfile, posts: updatedUserProfilePosts }));
        });

        toast.success("Caption updated");
        setIsEditing(false);
      }
    } catch (err) {
      console.error("❌ [Edit Caption] Failed:", err);
      toast.error("Update failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl p-0 flex flex-col bg-[#1e1e1e] text-white rounded-xl shadow-2xl z-50">
        <div className="flex h-[80vh]">
          <div className="w-1/2">
            <img
              className="w-full h-full object-cover rounded-l-xl"
              src={selectedPost?.image || ""}
              alt="post_img"
            />
          </div>

          <div className="w-1/2 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex gap-3 items-center">
                <Avatar>
                  <AvatarImage
                    className="h-10 w-10 rounded-full"
                    src={selectedPost?.author?.profilePicture || ""}
                  />
                  <AvatarFallback>{selectedPost?.author?.username?.[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{selectedPost?.author?.username}</span>
              </div>

              {isPostAuthor() && (
                <div className="relative group">
                  <MoreHorizontal className="cursor-pointer" />
                  <div className="absolute right-0 top-6 bg-[#2a2a2a] text-white border border-gray-700 rounded-md p-2 hidden group-hover:block z-50 text-sm">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-[#fff]"
                      onClick={() => {
                        setIsEditing(true);
                        setEditedCaption(selectedPost.caption || "");
                      }}
                    >
                      <Pencil size={16} className="mr-2 hover:text-black " /> Edit Caption
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:bg-[#fff]"
                      onClick={deletePostHandler}
                    >
                      <Trash2 size={16} className="mr-2" /> Delete Post
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="px-4 py-2 border-b border-gray-700">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-[#2a2a2a] border border-gray-600 text-white"
                  />
                  <Button onClick={updateCaptionHandler} size="sm">
                    Save
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-300">{selectedPost?.caption}</p>
              )}
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedPost?.comments?.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>

            {/* Add Comment */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 bg-[#2a2a2a] text-white rounded border border-gray-600 focus:outline-none"
                />
                <Button onClick={sentMessageHandler} disabled={!text.trim()} variant="secondary">
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
