import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import axios from 'axios';
import { setHasNewNotification } from '@/redux/notificationSlice';

const Notification = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "https://loomin-backend-production.up.railway.app";
    const notifications = useSelector((state) => state.notification.notifications);
    const dispatch = useDispatch();

    useEffect(() => {
        const markSeen = async () => {
            try {
                await axios.post(`${API_BASE_URL}/notification/mark-seen`, {}, { withCredentials: true });
                dispatch(setHasNewNotification(false)); // ✅ reset red dot
            } catch (error) {
                console.error("Error marking notifications as seen:", error);
            }
        };

        markSeen();
    }, [dispatch]);

    return (
        <div className="p-6 min-h-screen bg-[#121212] text-white">
            <h1 className="text-2xl font-bold mb-6">Notifications</h1>

            {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm">No notifications yet.</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((noti, index) => {
                        const sender = noti.sender || {};
                        const username = sender.username || 'Someone';
                        const profilePicture = sender.profilePicture;

                        let actionMessage = '';
                        switch (noti.type) {
                            case 'like':
                                actionMessage = 'liked your post';
                                break;
                            case 'dislike':
                                actionMessage = 'removed like from your post';
                                break;
                            case 'follow':
                                actionMessage = 'started following you';
                                break;
                            case 'comment':
                                actionMessage = 'commented on your post';
                                break;
                            default:
                                actionMessage = 'sent you a notification';
                        }

                        return (
                            <li
                                key={index}
                                className="bg-[#1e1e1e] rounded-xl p-4 flex items-center gap-4 shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition hover:bg-[#2a2a2a]"
                            >
                                <Avatar>
                                    <AvatarImage
                                        className="h-12 w-12 rounded-full"
                                        src={profilePicture}
                                        alt={username}
                                    />
                                    <AvatarFallback>{username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                    <span className="font-semibold">{username}</span>{" "}
                                    <span className="text-gray-400">{actionMessage}</span>
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
