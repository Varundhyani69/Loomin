import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const SuggestedUsers = () => {
    const { suggestedUsers = [] } = useSelector((store) => store.auth);

    return (
        <div className="my-8">
            <div className="flex items-center justify-between text-sm mb-4 px-2">
                <h2 className="font-semibold text-gray-400">Suggested for you</h2>
            </div>

            {suggestedUsers.length === 0 ? (
                <p className="text-gray-500 text-sm px-2">No suggestions available</p>
            ) : (
                <div className="space-y-5 px-2">
                    {suggestedUsers.map((user) => (
                        <div
                            key={user._id}
                            className="flex items-center justify-between gap-3"
                        >
                            {/* Profile Row */}
                            <div className="flex items-center gap-3 min-w-0">
                                <Link to={`/profile/${user._id}`}>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={user?.profilePicture}
                                            alt={user?.username}
                                        />
                                        <AvatarFallback>
                                            {user?.username?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="min-w-0">
                                    <h1 className="text-sm font-semibold text-white truncate">
                                        <Link to={`/profile/${user._id}`} className="hover:underline">
                                            {user?.username}
                                        </Link>
                                    </h1>
                                    <p className="text-xs text-gray-400 line-clamp-1">
                                        {user?.bio || 'No bio available'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SuggestedUsers;
