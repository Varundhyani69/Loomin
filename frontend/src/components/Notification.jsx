import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

const Notification = () => {
    const notifications = useSelector((state) => state.notification.notifications);

    return (
        <div className="p-6 ml-[16%]">
            <h1 className="text-xl font-bold mb-4">Notifications</h1>
            {notifications.length === 0 ? (
                <p className="text-gray-500">No notifications yet.</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((noti, index) => {
                        let actionMessage = "";

                        switch (noti.type) {
                            case 'like':
                                actionMessage = "liked your post";
                                break;
                            case 'dislike':
                                actionMessage = "removed like from your post";
                                break;
                            case 'follow':
                                actionMessage = "started following you";
                                break;
                            case 'comment':
                                actionMessage = "commented on your post";
                                break;
                            default:
                                actionMessage = noti.message || "sent you a notification";
                        }

                        return (
                            <li key={index} className="bg-white border rounded-lg p-4 flex gap-3 items-center shadow-sm">
                                <Avatar>
                                    <AvatarImage className='h-12 w-12 rounded-full' src={noti.userDetails?.profilePicture} alt={noti.userDetails?.username} />
                                    <AvatarFallback>{noti.userDetails?.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                    {noti.userDetails?.username} <span className="text-gray-600">{actionMessage}</span>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default Notification;
