import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const SuggestedUsers = () => {
    const { suggestedUsers = [] } = useSelector(store => store.auth); // ✅ fallback to []

    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer ml-2'>See All</span>
            </div>

            {suggestedUsers.length === 0 ? (
                <p className="text-gray-400 text-sm mt-4">No suggestions available</p>
            ) : (
                suggestedUsers.map((user) => (
                    <div key={user._id} className='flex items-center justify-between my-5'>
                        <div className="flex items-center gap-2">
                            <Link to={`/profile/${user._id}`}>
                                <Avatar>
                                    <AvatarImage className='h-10 w-10 rounded-full' src={user?.profilePicture} alt='Profile_Image' />
                                    <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div>
                                <h1 className='font-semibold text-sm'>
                                    <Link to={`/profile/${user._id}`}>{user?.username}</Link>
                                </h1>
                                <span className='text-gray-600 text-sm'>
                                    {user?.bio || "Bio Here..."}
                                </span>
                            </div>
                        </div>
                        <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3bacf88a]'>
                            Follow
                        </span>
                    </div>
                ))
            )}
        </div>
    );
};

export default SuggestedUsers;
