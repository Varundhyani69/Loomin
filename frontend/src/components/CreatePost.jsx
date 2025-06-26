import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle
} from '@radix-ui/react-dialog';
import React, { useRef, useState } from 'react';
import { DialogHeader } from './ui/dialog';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@radix-ui/react-avatar';
import { readFileAsDataURL } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';
import { setUserProfile } from '@/redux/authSlice';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState('');
  const [caption, setCaption] = useState('');
  const [imagePrev, setImagePrev] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, userProfile } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePrev(dataUrl);
    }
  };

  const createPostHandler = async () => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePrev) formData.append("image", file);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8080/api/v1/post/addpost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (res.data.success) {
        const newPost = res.data.post;
        dispatch(setPosts([newPost, ...posts]));
        dispatch(setUserProfile({
          ...userProfile,
          posts: [newPost, ...userProfile.posts],
        }));
        window.dispatchEvent(new Event('postCreated'));
        toast.success(res.data.message);
        setOpen(false);
        setCaption('');
        setFile('');
        setImagePrev('');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 bg-[#1e1e1e] text-white rounded-xl shadow-2xl z-50 space-y-4">
        <DialogHeader className="text-center font-semibold">
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage className="h-12 w-12 rounded-full" src={user?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="font-semibold text-sm">{user?.username}</h1>
        </div>

        {imagePrev && (
          <div className="w-full h-60 overflow-hidden rounded-xl flex items-center justify-center bg-black/10">
            <img
              src={imagePrev}
              alt="Preview"
              className="object-cover w-full h-full rounded-md"
            />
          </div>
        )}

        <Input
          onChange={fileChangeHandler}
          ref={imageRef}
          type="file"
          className="hidden"
        />
        <Textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="bg-[#2a2a2a] text-white border-none focus:ring-0"
        />

        <div className="flex justify-between gap-2">
          <Button
            onClick={() => imageRef.current.click()}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:opacity-90 cursor-pointer"
          >
            Select from computer
          </Button>
        </div>

        {imagePrev && (
          loading ? (
            <Button disabled className="w-full bg-[#333]">
              <Loader2 className="cursor-pointer mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </Button>
          ) : (
            <Button onClick={createPostHandler} className=" cursor-pointer w-full bg-[#0095F6] hover:bg-[#007be6]">
              Post
            </Button>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
