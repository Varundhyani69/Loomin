import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);

  if (!user) return null;

  return (
    <div className="w-fit my-10 pr-30">
      <div className="flex items-center gap-2">
        <Link to={`/profile/${user._id}`}>
          <Avatar>
            <AvatarImage className='rounded-full h-12 w-12' src={user?.profilePicture} alt="User" />
            <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className="font-semibold text-sm">
            <Link to={`/profile/${user._id}`}>{user?.username}</Link>
          </h1>
          <span className="text-gray-600 text-sm">
            {user?.bio || "Bio Here..."}
          </span>
        </div>
      </div>

      <SuggestedUsers />
    </div>
  );
};

export default RightSidebar;
