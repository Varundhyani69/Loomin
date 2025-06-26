import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const SuggestedUsers = () => {
    const { suggestedUsers = [] } = useSelector((store) => store.auth);

    return (
        <div className="my-10">
            <div className="flex items-center justify-between text-sm mb-3">
                <h2 className="font-semibold text-gray-400">Suggested for you</h2>
            </div>

            {suggestedUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No suggestions available</p>
            ) : (
                <div className="space-y-5">
                    {suggestedUsers.map((user) => (
                        <div key={user._id} className="flex items-center justify-between">
                            {/* Profile Row */}
                            <div className="flex items-center gap-3">
                                <Link to={`/profile/${user._id}`}>
                                    <Avatar>
                                        <AvatarImage
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={user?.profilePicture}
                                            alt="Profile_Image"
                                        />
                                        <AvatarFallback>
                                            {user?.username?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <h1 className="text-sm font-semibold text-white leading-tight">
                                        <Link to={`/profile/${user._id}`} className="hover:underline">
                                            {user?.username}
                                        </Link>
                                    </h1>
                                    <p className="text-xs text-gray-400">
                                        {user?.bio || 'No bio available'}
                                    </p>
                                </div>
                            </div>

                            {/* Follow Action */}
                            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition duration-200">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SuggestedUsers;
