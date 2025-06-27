import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';
import { Bell } from 'lucide-react';

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);
  const { hasNewNotification } = useSelector((store) => store.notification);

  if (!user) return null;

  return (
    <aside className="w-full max-w-xs px-4 py-8 text-white">
      {/* User Profile Preview */}
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/profile/${user._id}`}>
          <Avatar>
            <AvatarImage
              className="rounded-full h-12 w-12 object-cover"
              src={user?.profilePicture}
              alt={user?.username}
            />
            <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className="font-semibold text-sm leading-none">
            <Link to={`/profile/${user._id}`} className="hover:underline">
              {user?.username}
            </Link>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {user?.bio || 'No bio yet.'}
          </p>
        </div>
      </div>


      {/* Suggested Users */}
      <SuggestedUsers />
    </aside>
  );
};

export default RightSidebar;
