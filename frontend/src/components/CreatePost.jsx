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
import { setUserProfile } from '@/redux/authSlice'; // Correct import

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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (res.data.success) {
        const newPost = res.data.post;
        dispatch(setPosts([newPost, ...posts]));
        dispatch(setUserProfile({
          ...userProfile,
          posts: [newPost, ...userProfile.posts],
        }));
        window.dispatchEvent(new Event('postCreated')); // Trigger profile refresh
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

      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 bg-white rounded-md shadow-xl space-y-4 z-50">
        <DialogHeader className="text-center font-semibold">
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage className='h-12 w-12 rounded-full' src={user?.profilePicture} alt="image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-xs">{user?.username}</h1>
          </div>
        </div>

        {imagePrev && (
          <div className="w-full h-60 flex items-center justify-center overflow-hidden rounded">
            <img
              src={imagePrev}
              alt="prev_img"
              className="object-cover max-h-full rounded-md"
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
          className="focus-visible:ring-transparent border-none"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <Button
          onClick={() => imageRef.current.click()}
          className="w-fit mx-auto bg-[#0095F6] hover:bg-[#0094f6bc]"
        >
          Select from computer
        </Button>
        {
          imagePrev && (
            loading ? (
              <Button className='w-full'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Please Wait
              </Button>
            ) : (
              <Button onClick={createPostHandler} type='submit' className='w-full'>Post</Button>
            )
          )
        }
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;