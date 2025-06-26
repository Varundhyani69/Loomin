import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { setUserProfile } from '@/redux/authSlice';
import CommentDialog from './CommentDialog';
import { setSelectedPost } from '@/redux/postSlice';

const Profile = () => {
  const { id: userId } = useParams();
  const dispatch = useDispatch();
  const { userProfile, user } = useSelector((store) => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;

  const [isFollowing, setIsFollowing] = useState(false);
  const [active, setActive] = useState('post');
  const [open, setOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useGetUserProfile(userId, refreshFlag);

  useEffect(() => {
    if (user && userProfile && Array.isArray(userProfile.followers)) {
      setIsFollowing(userProfile.followers.includes(user._id));
    } else {
      setIsFollowing(false);
    }
  }, [userProfile, user]);

  const followUnfollowHandler = async () => {
    if (!user) return toast.error("Please log in to follow/unfollow");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/followorunfollow/${userProfile._id}`,
        {},
        { withCredentials: true }
      );
      if (!res.data.success) return toast.error(res.data.message);
      toast.success(res.data.message);

      const profileRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/${userProfile._id}/profile`,
        { withCredentials: true }
      );

      const data = profileRes.data.user ?? profileRes.data.profile;
      if (!data) return toast.error("Could not fetch updated profile");

      dispatch(setUserProfile(data));
      setIsFollowing(data.followers.includes(user._id));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  const shareProfileHandler = () => {
    if (!userProfile?._id) return toast.error("Profile not loaded");
    const profileUrl = `${window.location.origin}/profile/${userProfile._id}`;
    navigator.clipboard.writeText(profileUrl)
      .then(() => toast.success("Profile link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy profile link"));
  };

  const handlePostClick = async (post) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/post/${post._id}`, {
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setSelectedPost(res.data.post));
        setOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch full post", err);
      toast.error(err?.response?.data?.message || "Failed to fetch post");
    }
  };

  useEffect(() => {
    const handlePostCreated = () => {
      setRefreshFlag((prev) => prev + 1);
    };
    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, []);

  if (!userProfile) {
    return (
      <div className='flex max-w-5xl mx-auto justify-center p-8'>
        <div className="flex flex-col items-center gap-3">
          <div className="text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  const displayedPost = (active === 'post'
    ? userProfile?.posts
    : userProfile?.bookmarks
  )?.slice().sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

  return (
    <div className='flex max-w-5xl mx-auto justify-center pl-10'>
      <div className="flex flex-col gap-12 p-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
          <section className='flex items-center justify-center'>
            <Avatar className="h-40 items-center flex justify-center w-40">
              <AvatarImage
                className='h-full w-full object-cover rounded-full'
                src={userProfile?.profilePicture}
                alt="pfp"
              />
              <AvatarFallback className="text-xl">{userProfile?.username?.[0] || 'U'}</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5 items-center sm:items-start text-center sm:text-left'>
              <div>
                <span className="text-lg font-bold">{userProfile?.username || "Unknown User"}</span>
                <div className='flex items-center gap-2 mt-3 flex-wrap justify-center sm:justify-start'>
                  {isLoggedInUserProfile ? (
                    <>
                      <Link to='/account/edit'>
                        <Button variant='secondary' className="h-8 text-sm">Edit Profile</Button>
                      </Link>
                      <Button
                        variant='secondary'
                        className="h-8 text-sm"
                        onClick={shareProfileHandler}
                      >
                        <Share2 size={14} className="mr-1" /> Share Profile
                      </Button>
                    </>
                  ) : (
                    <>
                      {user && (
                        <Button
                          onClick={followUnfollowHandler}
                          className={`h-8 cursor-pointer text-sm ${isFollowing ? 'bg-gray-200 text-black' : 'bg-[#0095F6] text-white'}`}
                        >
                          {isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                      )}
                      {isFollowing && user && (
                        <Link to="/chat">
                          <Button variant='secondary' className="ml-2 h-8 text-sm cursor-pointer">Message</Button>
                        </Link>
                      )}
                      <Button
                        variant='secondary'
                        className="ml-2 h-8 text-sm cursor-pointer"
                        onClick={shareProfileHandler}
                      >
                        <Share2 size={14} className="mr-1" /> Share Profile
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-6 text-sm'>
                <p><span className='font-semibold'>{userProfile?.posts?.length || 0}</span> Posts</p>
                <p><span className='font-semibold'>{userProfile?.followers?.length || 0}</span> Followers</p>
                <p><span className='font-semibold'>{userProfile?.following?.length || 0}</span> Following</p>
              </div>
              <div className='flex flex-col gap-1 text-sm'>
                <span className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-gray-200'>
          <div className="flex items-center justify-center gap-10 text-sm mb-6">
            <span
              onClick={() => setActive('post')}
              className={`py-3 cursor-pointer ${active === 'post' ? 'font-bold border-t-2 border-black' : 'text-gray-500'}`}
            >
              POSTS
            </span>
            <span
              onClick={() => setActive('saved')}
              className={`py-3 cursor-pointer ${active === 'saved' ? 'font-bold border-t-2 border-black' : 'text-gray-500'}`}
            >
              SAVED
            </span>
          </div>
          {Array.isArray(displayedPost) && displayedPost.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedPost.map((post) => (
                <div
                  key={post._id}
                  className="relative group cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  <img
                    className="rounded-lg aspect-square object-cover w-full"
                    src={post.image}
                    alt="post_img"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                    <div className="flex items-center text-white space-x-4">
                      <div className="flex items-center gap-1">
                        <Heart size={16} />
                        <span>{post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={16} />
                        <span>{post.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No posts to display</div>
          )}
        </div>
        <CommentDialog open={open} setOpen={setOpen} />
      </div>
    </div>
  );
};

export default Profile;