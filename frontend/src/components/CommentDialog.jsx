import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@radix-ui/react-dialog";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Comment from "./Comment.jsx";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { setUserProfile } from "@/redux/authSlice";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const changeEventHandler = (e) => setText(e.target.value);

  const isPostAuthor = () => {
    if (!selectedPost || !user) return false;

    const authorId =
      typeof selectedPost.author === "string"
        ? selectedPost.author
        : selectedPost.author?._id?.toString(); // ensure string comparison
    console.log("USER:", user._id, "AUTHOR:", selectedPost.author);

    return user._id?.toString() === authorId;
  };

  const sentMessageHandler = async () => {
    if (!text.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:8080/api/v1/post/${selectedPost._id}/comment`,
        { text },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      if (res.data.success) {
        const newComment = res.data.comment;
        const updatedPosts = posts.map((post) =>
          post._id === selectedPost._id
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        );
        dispatch(setPosts(updatedPosts));
        dispatch(setSelectedPost(updatedPosts.find((p) => p._id === selectedPost._id)));
        setText("");
        toast.success("Comment added");
      }
    } catch {
      toast.error("Failed to post comment");
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:8080/api/v1/post/delete/${selectedPost._id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedPosts = posts.filter((p) => p._id !== selectedPost._id);
        dispatch(setPosts(updatedPosts));

        dispatch((dispatch, getState) => {
          const { auth } = getState();
          const updatedUserProfilePosts = auth.userProfile?.posts?.filter(
            (p) => p._id !== selectedPost._id
          );
          if (updatedUserProfilePosts) {
            dispatch(setUserProfile({
              ...auth.userProfile,
              posts: updatedUserProfilePosts,
            }));
          }
        });

        toast.success("Post deleted");
        setOpen(false);
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const updateCaptionHandler = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/v1/post/${selectedPost._id}/edit-caption`,
        { caption: editedCaption },
        { withCredentials: true }
      );

      if (res.data.success) {
        const getRes = await axios.get(
          `http://localhost:8080/api/v1/post/${selectedPost._id}`,
          { withCredentials: true }
        );

        const updatedPost = getRes.data.post;
        const updatedPosts = posts.map((p) =>
          p._id === updatedPost._id ? updatedPost : p
        );
        dispatch(setPosts(updatedPosts));
        dispatch(setSelectedPost(updatedPost));

        dispatch((dispatch, getState) => {
          const { auth } = getState();
          const updatedUserProfilePosts = auth.userProfile?.posts?.map((p) =>
            p._id === updatedPost._id ? updatedPost : p
          );
          if (updatedUserProfilePosts) {
            dispatch(setUserProfile({
              ...auth.userProfile,
              posts: updatedUserProfilePosts
            }));
          }
        });

        toast.success("Caption updated");
        setIsEditing(false);
      }
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl p-0 flex flex-col bg-white rounded-md shadow-xl z-50">
        <div className="flex h-[80vh]">
          {/* Left - Image */}
          <div className="w-1/2">
            <img
              className="w-full h-full object-cover rounded-l-md"
              src={selectedPost?.image || ""}
              alt="post_img"
            />
          </div>

          {/* Right - Content */}
          <div className="w-1/2 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex gap-3 items-center">
                <Avatar>
                  <AvatarImage className='h-10 w-10 rounded-full' src={selectedPost?.author?.profilePicture || ""} />
                  <AvatarFallback>{selectedPost?.author?.username?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-xs">{selectedPost?.author?.username}</span>
              </div>

              {isPostAuthor() && (
                <div className="relative group">
                  <MoreHorizontal className="cursor-pointer" />
                  <div className="absolute right-0 top-6 bg-white shadow-md border rounded-md p-2 hidden group-hover:block z-50 text-sm">
                    <Button
                      variant="ghost"
                      className="text-black hover:bg-gray-100 w-full justify-start"
                      onClick={() => {
                        setIsEditing(true);
                        setEditedCaption(selectedPost.caption || "");
                      }}
                    >
                      <Pencil size={16} className="mr-2" /> Edit Caption
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 w-full justify-start"
                      onClick={deletePostHandler}
                    >
                      <Trash2 size={16} className="mr-2" /> Delete Post
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="px-4 text-sm">
              {isEditing ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                  <Button onClick={updateCaptionHandler}>Save</Button>
                </div>
              ) : (
                <p>{selectedPost?.caption}</p>
              )}
            </div>

            <hr />

            {/* Comments */}
            <div className="flex-1 overflow-y-auto max-h-96 p-4">
              {selectedPost?.comments?.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>

            {/* Add Comment */}
            <div className="p-4">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="w-full outline-none border border-gray-300 p-2 rounded"
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sentMessageHandler}
                  variant="outline"
                >
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
